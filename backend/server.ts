
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import Groq from 'groq-sdk';
import { db } from './db/index';
import { callTranscripts } from './db/schema';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const wss = new WebSocketServer({ port: PORT });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log(`✅ [AI SALES COACH] Production Backend Running on Port ${PORT}`);

// Heartbeat
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.ping();
    });
}, 30000);

wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 Client connected');

    let deepgramLive: any = null;
    let keepAliveInterval: NodeJS.Timeout;

    // Call Context
    let currentCallId: string | null = null;
    let transcriptSequence = 0;

    // Performance Tracking
    const latencies: any = {
        audioRecv: 0,
        dgStart: 0,
        dgEnd: 0,
        aiStart: 0,
        aiEnd: 0
    };

    const setupDeepgram = (mode: 'stereo' | 'mono') => {
        if (deepgramLive) {
            deepgramLive.finish();
            deepgramLive = null;
        }

        const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

        // 1️⃣ DEEPGRAM REAL-TIME TUNING
        const baseOptions = {
            model: "nova-2",
            language: "en-US",
            smart_format: true,
            encoding: "linear16",
            sample_rate: 16000,
            punctuate: true,
            endpointing: 300,     // 300ms silence = end of utterance
            vad_turnoff: 200,     // Faster VAD
            utterances: false,    // We use is_final, not utterance events for speed
            // callback_window: 10 // Not supported in Node SDK types directly usually, but standard Nova-2 streaming defaults to low latency
        };

        const options = mode === 'stereo'
            ? {
                ...baseOptions,
                channels: 2,
                multichannel: true,
            }
            : {
                ...baseOptions,
                channels: 1,
                diarize: true,
            };

        deepgramLive = deepgram.listen.live(options);

        deepgramLive.on(LiveTranscriptionEvents.Open, () => {
            console.log(`🟢 Deepgram Live (${mode})`);
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            keepAliveInterval = setInterval(() => {
                if (deepgramLive && deepgramLive.getReadyState() === 1) deepgramLive.keepAlive();
            }, 10000);
        });

        deepgramLive.on(LiveTranscriptionEvents.Transcript, async (data: any) => {
            latencies.dgEnd = performance.now();

            const isFinal = data.is_final;
            let transcript = "";
            let speaker = "Unknown"; // Default

            // 3️⃣ SPEAKER MAPPING STABILITY
            if (mode === 'stereo') {
                const channel = data.channel;
                const alternative = channel?.alternatives?.[0];
                if (alternative && alternative.transcript) {
                    transcript = alternative.transcript;
                    const channelIdx = data.channel_index?.[0] ?? 0;
                    // Deterministic: Ch 0 = Rep (Left), Ch 1 = Customer (Right)
                    speaker = channelIdx === 0 ? "Rep" : "Customer";
                }
            } else {
                // Mono Diarization
                const alternative = data.channel?.alternatives?.[0];
                if (alternative && alternative.transcript) {
                    transcript = alternative.transcript;
                    const word = alternative.words?.[0];
                    const speakerIdx = word ? word.speaker : 0;
                    // Deterministic: Spk 0 = Rep, Spk 1 = Customer
                    speaker = speakerIdx === 0 ? "Rep" : (speakerIdx === 1 ? "Customer" : `Participant ${speakerIdx}`);
                }
            }

            if (transcript.trim()) {
                // Measure STT Latency
                const sttLatency = Math.round(latencies.dgEnd - latencies.dgStart);

                const payload = {
                    type: "transcript",
                    role: speaker,
                    text: transcript,
                    is_final: isFinal,
                    timestamp: Date.now()
                };
                ws.send(JSON.stringify(payload));

                // 4️⃣ DB STORAGE (Step 4 Requirement)
                // If final and we have a call_id, save it.
                if (isFinal && currentCallId) {
                    try {
                        transcriptSequence++;
                        // Insert without awaiting to keep WebSocket fast (Fire & Forget logic)
                        db.insert(callTranscripts).values({
                            callId: currentCallId,
                            speaker: speaker.toLowerCase(),
                            text: transcript,
                            timestampMs: Math.floor(performance.now()), // Relative offset, could be refined
                            sequence: transcriptSequence
                        }).execute().catch(err => console.error("DB Insert Error:", err));
                    } catch (e) {
                        console.error("DB Logic Error:", e);
                    }
                }

                // Trigger AI Logic (Only Final + Customer)
                if (isFinal && (speaker === "Customer" || speaker.includes("Participant"))) {
                    latencies.aiStart = performance.now();
                    runAIAnalysis(transcript, speaker, ws, sttLatency);
                } else {
                    // Send Partial Stats
                    ws.send(JSON.stringify({
                        type: "stats",
                        latency_stt: sttLatency,
                        latency_ai: 0,
                        latency_total: sttLatency
                    }));
                }
            }
        });

        deepgramLive.on(LiveTranscriptionEvents.Error, (e: any) => console.error("DG Error", e));
    };

    // Initialize
    setupDeepgram('stereo');

    ws.on('message', (message, isBinary) => {
        if (!isBinary) {
            try {
                const msg = JSON.parse(message.toString());

                // NEW: Handle Call Init
                if (msg.type === 'init' && msg.call_id) {
                    currentCallId = msg.call_id;
                    console.log(`📞 Call ID Set: ${currentCallId}`);
                }

                if (msg.type === 'config' && msg.mode) {
                    console.log(`🔄 Switching Mode to ${msg.mode}`);
                    setupDeepgram(msg.mode);
                }
            } catch (e) { }
            return;
        }

        // Binary Audio
        // 4️⃣ REAL-TIME LOGGING
        latencies.audioRecv = performance.now();
        latencies.dgStart = performance.now(); // Approx start of DG processing

        if (deepgramLive && deepgramLive.getReadyState() === 1) {
            deepgramLive.send(message);
        }
    });

    ws.on('close', () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (deepgramLive) deepgramLive.finish();
        console.log("🔌 Client disconnected");
    });
});

// Fixed runAIAnalysis with proper latency calculation
async function runAIAnalysis(text: string, speaker: string, ws: WebSocket, sttLatency: number) {
    if (!process.env.GROQ_API_KEY) return;
    if (text.split(' ').length < 3) return;

    const aiStart = performance.now();

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an elite sales coach listening to a live call. The text provided is what the CUSTOMER just said. Your goal: Provide one immediate, high-impact short coaching tip (max 12 words) for the Sales Rep. Example: 'Ask about their budget now.' or 'Acknowledge the objection.' If the customer text is neutral/boring, return null JSON."
                },
                { role: "user", content: text }
            ],
            model: "llama3-70b-8192",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        const aiEnd = performance.now();
        const aiLatency = Math.round(aiEnd - aiStart);
        const totalLatency = sttLatency + aiLatency;

        if (content) {
            const json = JSON.parse(content);
            if (json.hint) {
                // 4️⃣ & TASK 4: FULL EVENT FORMAT
                const payload = {
                    type: "ai_hint",
                    hint: json.hint,
                    speaker: speaker,
                    timestamp: Date.now()
                };
                // Make sure WS is open before sending
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(payload));

                    // Send Stats
                    ws.send(JSON.stringify({
                        type: "stats",
                        latency_stt: sttLatency,
                        latency_ai: aiLatency,
                        latency_total: totalLatency
                    }));
                }
            }
        }
    } catch (e) {
        console.error("AI Error:", e);
    }
}
