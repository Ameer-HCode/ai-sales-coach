
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import Groq from 'groq-sdk';
import { db } from './db/index';
import { callTranscripts, calls, customerMemory, customers, callContexts } from './db/schema'; // Added required imports
import { eq, and, desc } from 'drizzle-orm'; // Added required imports
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = parseInt(process.env.PORT || '5001', 10);
const wss = new WebSocketServer({ port: PORT });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log(`✅ [AI SALES COACH] Production Backend Running on Port ${PORT}`);

// Heartbeat
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.ping();
    });
}, 30000);

// --- GLOBAL HELPER: END CALL LOGIC ---
async function handleCallEnd(callId: string, ws: WebSocket | null) {
    console.log("🛑 CALL ENDED. FETCHING FULL TRANSCRIPT...");
    try {
        // 1. Fetch Full Transcript from Supabase
        const transcripts = await db.select().from(callTranscripts)
            .where(eq(callTranscripts.callId, callId))
            .orderBy(callTranscripts.sequence);

        console.log("FULL TRANSCRIPT LOADED:", transcripts.length);

        if (transcripts.length === 0) {
            console.warn("⚠️ No transcripts found. Skipping summary.");
            return;
        }

        // 2. Concatenate Transcript
        const fullText = transcripts.map(t => `${t.speaker === 'owner' ? 'Owner' : 'Client'}: ${t.text}`).join('\n');

        // 3. Fetch past memory if exists
        const callRecords = await db.select().from(calls).where(eq(calls.id, callId)).limit(1);
        const callRecord = callRecords[0];

        let pastMemoryStr = "No previous memory available. This is the first call.";
        if (callRecord?.customerId) {
            const memories = await db.select().from(customerMemory)
                .where(eq(customerMemory.customerId, callRecord.customerId as string))
                .orderBy(desc(customerMemory.createdAt))
                .limit(1);
            if (memories.length > 0) {
                pastMemoryStr = JSON.stringify(memories[0].summaryJson);
            }
        }

        // 4. Send to Groq for Summary
        console.log("GENERATING SUMMARY JSON...");
        const systemPrompt = `You are an expert Real Estate AI Sales Analyst.
You will receive a complete transcript of a new real estate sales call, AND the JSON "Master Profile" from the client's previous calls.

Your job is to MERGE the old Master Profile with the new insights from the current transcript to produce an UPDATED Master Profile.
DO NOT simply summarize only the new call. You must intelligently merge the data so the new profile retains critical past details (e.g., past budgets, rejected properties, old objections) while adding the new developments. 
Keep lists strictly concise (Maximum 5 bullet points per array). Throw out old, irrelevant data if it was resolved in this new call.

RULES:
- Output ONLY JSON.
- No prose.
- No explanation.
- No markdown.
- No greeting.

JSON KEYS REQUIRED:
"summary" (Brief 2-3 sentence overview of the entire relationship and latest status)
"key_points" (Max 5 bullet points)
"objections" (Max 5 bullet points)
"client_needs" (Max 5 bullet points)
"opportunities" (Max 5 bullet points)
"recommendations" (Max 5 bullet points)
"next_steps" (Max 5 bullet points)

OLD MASTER PROFILE TO UPDATE AND MERGE:
${pastMemoryStr}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "NEW TRANSCRIPT:\n" + fullText }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const summaryJsonStr = completion.choices[0]?.message?.content;
        if (!summaryJsonStr) throw new Error("Empty AI Response");

        let summaryJson;
        try {
            summaryJson = JSON.parse(summaryJsonStr);
            console.log("FINAL GROQ SUMMARY JSON:", summaryJson);
            console.log("VALID JSON:", summaryJson); // Per strict log req
        } catch (e) {
            console.error("❌ Invalid JSON from Groq:", summaryJsonStr);
            return;
        }

        // 5. Store in Call Memory

        // Update Call Status
        await db.update(calls).set({ status: 'ended', endedAt: new Date() }).where(eq(calls.id, callId));

        if (callRecord?.customerId) {
            await db.insert(customerMemory).values({
                callId: callId,
                customerId: callRecord.customerId as string,
                summaryJson: summaryJson
            });
            console.log("SAVED CALL MEMORY SUCCESSFULLY (WITH CUSTOMER)"); 
        } else {
            console.log("⚠️ No Customer ID linked. Storing memory with NULL customer for now.");
            await db.insert(customerMemory).values({
                callId: callId,
                summaryJson: summaryJson
            });
            console.log("SAVED CALL MEMORY SUCCESSFULLY (WITHOUT CUSTOMER)");
        }

        // 5. Delete Old Transcripts (Cleanup)
        console.log("DELETING OLD TRANSCRIPTS FOR CALL:", callId);
        await db.delete(callTranscripts).where(eq(callTranscripts.callId, callId));
        console.log("TRANSCRIPT DELETED.");

    } catch (e) {
        console.error("❌ End-Call Pipeline Failed:", e);
    }
}

// --- MAIN WEBSOCKET SERVER ---
wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 Client connected');

    let deepgramLive: any = null;
    let keepAliveInterval: NodeJS.Timeout;

    // Audio Buffer for Connection Handling
    const audioQueue: Buffer[] = [];
    let isDeepgramReady = false;

    // Call Context
    let currentCallId: string | null = null;
    let transcriptSequence = 0;

    // Memory Context
    let previousContext = "";
    const callTranscriptContext: string[] = []; // Store rolling context

    // Performance Tracking
    const latencies: any = { dgStart: 0, dgEnd: 0 };

    // 📡 REMOTE LOGGING HELPER
    const sendDebugLog = (label: string, data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'debug_log',
                label,
                data,
                timestamp: Date.now()
            }));
        }
    };

    const setupDeepgram = (mode: 'stereo' | 'mono') => {
        if (deepgramLive) {
            deepgramLive.finish();
            deepgramLive = null;
            isDeepgramReady = false;
        }

        if (!process.env.DEEPGRAM_API_KEY) {
            console.error("❌ DEEPGRAM API KEY MISSING");
            return;
        }
        console.log("DEEPGRAM KEY LENGTH:", process.env.DEEPGRAM_API_KEY.length);

        const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

        const options = mode === 'stereo'
            ? {
                model: "nova-2",
                language: "en-US",
                smart_format: true,
                encoding: "linear16",
                sample_rate: 16000,
                punctuate: true,
                endpointing: 300,
                channels: 2,
                multichannel: true,
                interim_results: true
            }
            : {
                model: "nova-2",
                language: "en-US",
                smart_format: true,
                encoding: "linear16",
                sample_rate: 16000,
                punctuate: true,
                endpointing: 300,
                channels: 1,
                diarize: true,
                interim_results: true
            };

        deepgramLive = deepgram.listen.live(options);

        // --- DEEPGRAM EVENTS ---
        deepgramLive.on(LiveTranscriptionEvents.Open, () => {
            console.log(`🟢 Deepgram Live (${mode}) - CONNECTION OPEN`);
            isDeepgramReady = true;

            // Flush Buffer
            if (audioQueue.length > 0) {
                console.log(`🚿 Flushing ${audioQueue.length} buffered chunks to Deepgram...`);
                while (audioQueue.length > 0) {
                    const chunk = audioQueue.shift();
                    if (chunk) deepgramLive.send(chunk);
                }
            }

            if (keepAliveInterval) clearInterval(keepAliveInterval);
            keepAliveInterval = setInterval(() => {
                if (deepgramLive && deepgramLive.getReadyState() === 1) deepgramLive.keepAlive();
            }, 10000);
        });

        deepgramLive.on(LiveTranscriptionEvents.Transcript, async (data: any) => {
            latencies.dgEnd = performance.now();
            const isFinal = data.is_final;
            const isSpeechFinal = data.speech_final;
            let transcript = "";
            let speaker = "Unknown";

            // LOG EVERY TRANSCRIPT EVENT
            // console.log("🔍 DEEPGRAM EVENT:", { isFinal, isSpeechFinal, channel: !!data.channel });

            // Determine Speaker
            if (mode === 'stereo') {
                const channel = data.channel;
                const alternative = channel?.alternatives?.[0];
                if (alternative && alternative.transcript) {
                    transcript = alternative.transcript;
                    const channelIdx = data.channel_index?.[0] ?? 0;
                    speaker = channelIdx === 0 ? "owner" : "client";
                    console.log(`[STT] ${speaker.toUpperCase()}: "${transcript}" (final: ${isFinal}, speech_final: ${isSpeechFinal})`);
                }
            } else {
                const alternative = data.channel?.alternatives?.[0];
                if (alternative && alternative.transcript) {
                    transcript = alternative.transcript;
                    const word = alternative.words?.[0];
                    const speakerIdx = word ? word.speaker : 0;
                    speaker = speakerIdx === 0 ? "owner" : "client";
                }
            }

            if (transcript.trim()) {
                // console.log("TRANSCRIPT GENERATED:", transcript); // Verbose

                // Send to Frontend (Mapped for UI: 'owner'->'Rep', 'client'->'Customer')
                const uiRole = speaker === "owner" ? "Rep" : "Customer";
                const payload = {
                    type: "transcript",
                    role: uiRole,
                    text: transcript,
                    is_final: isFinal,
                    timestamp: Date.now()
                };
                ws.send(JSON.stringify(payload));

                // GROQ LIVE SUGGESTION
                const isSpeechFinal = data.speech_final;

                if (isFinal) {
                    callTranscriptContext.push(`${speaker === 'owner' ? 'Agent' : 'Client'}: ${transcript}`);
                    if (callTranscriptContext.length > 20) callTranscriptContext.shift();
                }

                if (isSpeechFinal && speaker === "client") {
                    console.log(`🎯 DETECTED CLIENT SPEECH END. Triggering Groq...`);
                    const recentContext = callTranscriptContext.join('\n');
                    runLiveGroqSuggestion(transcript, recentContext, ws, currentCallId);
                }

                // DB INSERTS
                if (isFinal && currentCallId) {
                    transcriptSequence++;
                    console.log("STORING TRANSCRIPT:", { callId: currentCallId, speaker, text: transcript }); // Strict Log

                    try {
                        await db.insert(callTranscripts).values({
                            callId: currentCallId,
                            speaker: speaker, // 'owner' or 'client'
                            text: transcript,
                            timestampMs: Math.floor(performance.now()),
                            sequence: transcriptSequence
                        });
                    } catch (e) {
                        console.error("❌ SUPABASE INSERT ERROR:", e);
                    }
                }
            }
        });

        deepgramLive.on(LiveTranscriptionEvents.Error, (e: any) => {
            console.error("❌ DEEPGRAM ERROR:", e);
        });

        deepgramLive.on(LiveTranscriptionEvents.Close, (e: any) => {
            console.log("🔌 DEEPGRAM CLOSED", e);
            isDeepgramReady = false;
        });
    };

    // NOTE: Deepgram is NOT initialized here on connect.
    // It is initialized ONLY when 'start_stream' is received.
    // This prevents Deepgram's 10-second idle timeout from expiring
    // before the user has joined the call and granted mic permissions.

    // --- WEBSOCKET CLIENT MESSAGES ---
    ws.on('message', async (message, isBinary) => {
        if (!isBinary) {
            try {
                const msg = JSON.parse(message.toString());

                // NEW: Handle Call Init (Frontend sends 'start_stream')
                if ((msg.type === 'init' && msg.call_id) || (msg.type === 'start_stream' && msg.meetingId)) {
                    currentCallId = msg.call_id || msg.meetingId;

                    // ✅ FIX: Initialize Deepgram HERE (not on WS connect) to avoid premature timeout
                    setupDeepgram(msg.mode || 'stereo');

                    // Simple UUID Validation
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    if (!uuidRegex.test(currentCallId!)) {
                        console.error(`❌ Invalid Call ID (Not UUID): ${currentCallId}`);
                        // Optionally close connection or ignore
                        // ws.close(1008, "Invalid Call ID");
                        // return; 
                        // For now just log, to allow weak inputs if needed, but DB will fail.
                    }

                    console.log(`📞 Call ID Set: ${currentCallId}`);

                    // TEST HINT TO VERIFY UI
                    setTimeout(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            console.log("🚀 SENDING STARTUP TEST HINT");
                            ws.send(JSON.stringify({
                                type: "ai_hint",
                                hint: "Pipeline active. Listening for your first move!",
                                timestamp: Date.now()
                            }));
                        }
                    }, 2000);
                    // Ensure DB has this call ID? 
                    // Usually frontend creates call in DB first. We assume it exists.

                    // LOAD MEMORY
                    try {
                        let preCallBriefText = "";
                        // We will dynamically load memory in runLiveGroqSuggestion instead of here, 
                        // because the Guest might join *after* this WebSocket connection starts.
                    } catch (e) { console.error("Memory/Brief Load Error:", e); }
                }

                if (msg.type === 'end_call') {
                    if (currentCallId) await handleCallEnd(currentCallId, ws);
                    currentCallId = null;
                }

                if (msg.type === 'config' && msg.mode) {
                    setupDeepgram(msg.mode);
                }

                if (msg.type === 'debug_force_hint') {
                    console.log("🚀 DEBUG: FORCING AI HINT...");
                    runLiveGroqSuggestion("Tell me more about your pricing structure and implementation timeline.", callTranscriptContext.join('\n'), ws, currentCallId);
                }
                
                if (msg.type === 'trigger_groq' && msg.text) {
                    console.log(`🎯 MANUAL GROQ TRIGGER: ${msg.text}`);
                    runLiveGroqSuggestion(msg.text, callTranscriptContext.join('\n'), ws, currentCallId);
                } else if (msg.type === 'trigger_groq') {
                    // Fallback
                    runLiveGroqSuggestion("Tell me more about your pricing structure and implementation timeline.", callTranscriptContext.join('\n'), ws, currentCallId);
                }
            } catch (e) { console.error('[WS] Failed to parse JSON message:', e); }
            return;
        }

        // BINARY AUDIO HANDLING
        const buffer = message as Buffer;
        if (buffer.length > 0) {
            console.log(`📥 BINARY RECEIVED: ${buffer.length} bytes`);
        }

        if (isDeepgramReady && deepgramLive && deepgramLive.getReadyState() === 1) {
            deepgramLive.send(buffer);
            // console.log("SENDING TO DEEPGRAM:", buffer.length);
        } else {
            // BUFFERING
            if (audioQueue.length < 500) { // Limit buffer size
                audioQueue.push(buffer);
                // console.log("WARN: Deepgram not ready. Buffering chunk...", audioQueue.length);
            }
        }
    });

    ws.on('close', async () => {
        console.log("🔌 Client disconnected");
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (deepgramLive) deepgramLive.finish();

        if (currentCallId) {
            console.log("⚠️ Connection closed with active call. Triggering safety summary...");
            await handleCallEnd(currentCallId, null);
        }
    });
});

// --- LIVE SUGGESTION LOGIC ---
async function runLiveGroqSuggestion(clientText: string, liveTranscriptContext: string, ws: WebSocket, currentCallId: string | null) {
    console.log("GROQ PROMPT SENT:", clientText); // Strict Log

    if (!process.env.GROQ_API_KEY) {
        console.error("❌ GROQ API KEY MISSING");
        return;
    }
    if (!clientText || clientText.trim().length === 0) return;

    let memoryContext = "";

    if (currentCallId) {
        try {
            const preContextRows = await db.select().from(callContexts).where(eq(callContexts.callId, currentCallId)).limit(1);
            let preCallBriefText = "";
            if (preContextRows.length > 0) {
                const p = preContextRows[0];
                preCallBriefText = `Pre-Call Brief:
Topic: ${p.topic || 'N/A'}
Problem: ${p.problem || 'N/A'}
Proposed Solution: ${p.solution || 'N/A'}
Objection Handling Style: ${p.handlingStyle || 'N/A'}
Previous Context: ${p.previousContext || 'N/A'}`;
            }

            const callRecords = await db.select().from(calls).where(eq(calls.id, currentCallId)).limit(1);
            const call = callRecords[0];

            if (call?.customerId) {
                const memories = await db.select().from(customerMemory)
                    .where(eq(customerMemory.customerId, call.customerId as string))
                    .orderBy(desc(customerMemory.createdAt))
                    .limit(1);

                if (memories.length > 0) {
                    memoryContext = preCallBriefText + "\n\nPAST MEMORY WITH THIS CLIENT: " + JSON.stringify(memories[0].summaryJson);
                } else {
                    memoryContext = preCallBriefText;
                }
            } else {
                memoryContext = preCallBriefText;
            }
        } catch (e) {
            console.error("Failed to load memory context for Groq:", e);
        }
    }

    try {
        const systemPrompt = `You are an elite Real Estate AI Sales Coach advising a real estate agent during a live call.
Here is the context and briefing for this specific call:
${memoryContext || "None provided. Use general real estate best practices."}

Recent conversation history:
${liveTranscriptContext}

Your job:
- Provide ONE short, highly specific, tactical suggestion to the agent based on what the client just said.
- **OUT OF DOMAIN HANDLING**: If the client asks about or discusses something completely unrelated to real estate (e.g., cars, software, unrelated consulting, random chatter), guide the agent to politely pivot the conversation BACK to real estate. Provide the exact wording to transition back (e.g., "That's interesting! By the way, speaking of moving forward, did you want to review the layout for the suburban property?").
- **NEGOTIATION & BOTTOM LINE**: If the client mentions price or budget, remember their numbers. If there is a "Bottom Line" price listed in the briefing, guide the agent to start higher and slowly negotiate down, but strictly warn the agent NEVER to accept an offer below that bottom line. (e.g., "They offered $190k. Hold firm—remind them your absolute lowest is $200k because of the recent upgrades.").
- Use real estate terminology (comps, appraisals, escrow, contingencies, ROI, bedrooms, square footage).
- If the client immediately throws an objection like "I am not interested" right at the start of the call, give the agent a powerful "pattern interrupt" to keep them on the line (e.g., "Acknowledge the interruption and pivot: 'I completely understand I caught you out of the blue, but if I could show you an off-market property that matches your criteria, would you give me 30 seconds?'").
- If they mention a specific property price or feature (e.g. $50,000 vs $100,000), remember it and use it in your advice. Address why the price differs if asked.
- Give them exact words or specific value propositions to use.
- Do NOT output generic advice like "Acknowledge their concern".
- Do NOT hallucinate objections if the client hasn't made them.
- Do NOT output JSON.
- Do NOT greet or introduce yourself.

Output ONLY the suggestion text (max 2 sentences).`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is what the client just said: "${clientText}"` }
            ],
            model: "llama-3.1-8b-instant", // Faster model for real-time
        });

        // console.log("GROQ RAW RESPONSE:", completion); // Strict Log

        const suggestion = completion.choices[0]?.message?.content;

        if (suggestion && suggestion.trim()) {
            console.log("LIVE SUGGESTION:", suggestion); // Strict Log

            if (ws.readyState === WebSocket.OPEN) {
                console.log("EMITTING SUGGESTION TO FRONTEND"); // Strict Log
                ws.send(JSON.stringify({
                    type: "ai_hint",
                    hint: suggestion,
                    timestamp: Date.now()
                }));
            }
        } else {
            console.warn("⚠️ Groq returned empty suggestion. Using fallback.");
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "ai_hint",
                    hint: "Acknowledge their concern and ask a clarifying question.",
                    timestamp: Date.now()
                }));
            }
        }

    } catch (e) {
        console.error("❌ LIVE GROQ ERROR:", e);
        // Fallback for presentation purposes if API fails
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "ai_hint",
                hint: "Highlight the return on investment and offer to walk them through a quick case study.",
                timestamp: Date.now()
            }));
        }
    }
}
