"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

export interface Diagnostics {
    micLevel: number; // 0-1
    remoteLevel: number; // 0-1
    wsState: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'RECONNECTING';
    sttLatency: number;
    aiLatency: number;
    totalLatency: number;
}

export interface AISuggestion {
    hint: string;
    speaker: string;
    timestamp: number;
}

interface AudioStreamHook {
    isRecording: boolean;
    startAudio: () => Promise<void>;
    stopAudio: () => void;
    error: string | null;
    transcript: string;
    aiSuggestions: AISuggestion[]; // Array!
    diagnostics: Diagnostics;
}

export function useAudioStream(meetingId: string, userId: string, participantCount: number, isHost: boolean = true): AudioStreamHook {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>("");
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]); // Array State
    const [diagnostics, setDiagnostics] = useState<Diagnostics>({
        micLevel: 0,
        remoteLevel: 0,
        wsState: 'CLOSED',
        sttLatency: 0,
        aiLatency: 0,
        totalLatency: 0
    });

    // Stream SDK
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();

    // Refs
    const wsInstance = useRef<WebSocket | null>(null);
    const retryCount = useRef(0);
    const shouldReconnect = useRef(false);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const mergerRef = useRef<ChannelMergerNode | null>(null);

    // Sources
    const micStreamRef = useRef<MediaStream | null>(null);
    const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const remoteSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // Mode
    const currentMode = useRef<'stereo' | 'mono'>('stereo');
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        // Initial Auto-Start logic is triggered below in a separate effect

        return () => {
            isMounted.current = false;
            shouldReconnect.current = false;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);

            // Signal End Call
            if (wsInstance.current?.readyState === WebSocket.OPEN) {
                wsInstance.current.send(JSON.stringify({ type: 'end_call' }));
            }

            cleanupAudio();
            wsInstance.current?.close();
        };
    }, []);

    const cleanupAudio = useCallback(() => {
        micSourceRef.current?.disconnect();
        remoteSourceRef.current?.disconnect();
        mergerRef.current?.disconnect();
        workletNodeRef.current?.disconnect();
        micStreamRef.current?.getTracks().forEach(t => t.stop());
        audioContextRef.current?.close();

        micSourceRef.current = null;
        remoteSourceRef.current = null;
        mergerRef.current = null;
        workletNodeRef.current = null;
        micStreamRef.current = null;
        audioContextRef.current = null;

        setIsRecording(false);
    }, []);

    // ----------------------------------------------------------------
    // WEBSOCKET MANAGER (Detailed Logging + Backoff)
    // ----------------------------------------------------------------
    const connectWebSocket = useCallback(() => {
        if (!isHost) return;
        if (wsInstance.current?.readyState === WebSocket.OPEN || wsInstance.current?.readyState === WebSocket.CONNECTING) return;

        shouldReconnect.current = true;
        setDiagnostics(prev => ({ ...prev, wsState: retryCount.current > 0 ? 'RECONNECTING' : 'CONNECTING' }));

        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const wsUrl = isLocal 
            ? "ws://localhost:5001" 
            : "wss://marylee-brotherlike-rosily.ngrok-free.dev";

        console.log(`[WS] Connecting... Attempt ${retryCount.current + 1}`);
        const ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";
        wsInstance.current = ws;
        (window as any).debugWs = ws;

        ws.onopen = () => {
            console.log("[WS] Connected");
            retryCount.current = 0; // Reset
            setDiagnostics(prev => ({ ...prev, wsState: 'OPEN' }));
            setError(null);

            // Send Handshake
            ws.send(JSON.stringify({
                type: 'start_stream',
                meetingId,
                userId,
                mode: currentMode.current
            }));
        };

        ws.onmessage = (event) => {
            try {
                // 🔥 STEP 6 — VERIFY FRONTEND RECEIVES THE ai_hint
                console.log("📨 FRONTEND WS MESSAGE:", event.data);

                const data = JSON.parse(event.data);

                // 🛠 REMOTE DEBUG LOGGING
                if (data.type === 'debug_log') {
                    console.log(`%c[BACKEND] ${data.label}`, 'color: #00ff00; font-weight: bold;', data.data);
                    return;
                }

                if (data.type === "transcript") {
                    setTranscript(data.text);
                } else if (data.type === "ai_hint") {
                    // 🔥 STEP 6 (Confirmed)
                    console.log("🎯 AI HINT RECEIVED:", data.hint);

                    // 🔥 STEP 7 — VERIFY STATE UPDATE
                    console.log("🧠 ADDING AI SUGGESTION TO STATE:", data);

                    // APPEND Logic
                    setAiSuggestions(prev => [
                        ...prev,
                        {
                            hint: data.hint,
                            speaker: data.speaker || "Customer",
                            timestamp: data.timestamp || Date.now()
                        }
                    ]);
                } else if (data.type === "stats") {
                    setDiagnostics(prev => ({
                        ...prev,
                        sttLatency: data.latency_stt,
                        aiLatency: data.latency_ai,
                        totalLatency: data.latency_total
                    }));
                }
            } catch (e) { console.error("[WS] Failed to parse message:", e, event.data); }
        };

        ws.onclose = () => {
            console.warn("[WS] Closed");
            setDiagnostics(prev => ({ ...prev, wsState: 'CLOSED' }));

            if (shouldReconnect.current && retryCount.current < 5) {
                const delay = [500, 1000, 2000, 5000, 10000][retryCount.current] || 10000;
                const jitter = delay * 0.1 * (Math.random() * 2 - 1); // +/- 10%
                const finalDelay = delay + jitter;

                console.log(`[WS] Retrying in ${Math.round(finalDelay)}ms...`);
                reconnectTimeout.current = setTimeout(() => {
                    retryCount.current++;
                    connectWebSocket();
                }, finalDelay);
            } else if (retryCount.current >= 5) {
                setError("Connection failed. Max retries reached.");
            }
        };

        ws.onerror = (e) => {
            console.error("[WS] Error", e);
        };

    }, [meetingId, userId]);


    // ----------------------------------------------------------------
    // MODE SWITCHER
    // ----------------------------------------------------------------
    useEffect(() => {
        if (!isMounted.current) return;
        const mode = participantCount > 2 ? 'mono' : 'stereo';
        if (mode !== currentMode.current) {
            console.log(`[AudioConfig] Mode ${currentMode.current} -> ${mode}`);
            currentMode.current = mode;
            if (wsInstance.current?.readyState === WebSocket.OPEN) {
                wsInstance.current.send(JSON.stringify({ type: 'config', mode }));
            }
        }
    }, [participantCount]);

    // ----------------------------------------------------------------
    // REMOTE AUDIO
    // ----------------------------------------------------------------
    useEffect(() => {
        if (!isRecording || !audioContextRef.current || !mergerRef.current) return;
        if (currentMode.current !== 'stereo') return;

        const remoteP = participants.find(p => !p.isLocalParticipant && p.audioStream);
        if (remoteP && remoteP.audioStream && !remoteSourceRef.current) {
            console.log("🎧 Attaching Remote Stream");
            try {
                const ctx = audioContextRef.current;
                const src = ctx.createMediaStreamSource(remoteP.audioStream);
                remoteSourceRef.current = src;
                src.connect(mergerRef.current, 0, 1);
            } catch (e) { console.error(e); }
        }
    }, [participants, isRecording]);


    const startAudio = async () => {
        if (!isHost) return;
        if (isRecording) return;

        // Ensure WS is connecting/connected
        if (!wsInstance.current || wsInstance.current.readyState === WebSocket.CLOSED) {
            connectWebSocket();
        }

        try {
            console.log("🚀 Starting Audio Pipeline");
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = ctx;

            // Log state to backend
            if (wsInstance.current?.readyState === WebSocket.OPEN) {
                wsInstance.current.send(JSON.stringify({
                    type: 'debug_log',
                    label: 'Browser Audio State',
                    data: { state: ctx.state, sampleRate: ctx.sampleRate }
                }));
            }

            await ctx.audioWorklet.addModule("/audio-processor.js");
            const worklet = new AudioWorkletNode(ctx, "audio-processor");
            workletNodeRef.current = worklet;

            const merger = ctx.createChannelMerger(2);
            mergerRef.current = merger;

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });
            micStreamRef.current = stream;

            const micSrc = ctx.createMediaStreamSource(stream);
            micSourceRef.current = micSrc;
            micSrc.connect(merger, 0, 0);

            // Connect Remote if already exists (otherwise effect handles it)
            // But merger needs to be connected to Worklet
            merger.connect(worklet);

            // Worklet to Silent Destination (Hack to keep it running)
            const silentGain = ctx.createGain();
            silentGain.gain.value = 0;
            worklet.connect(silentGain);
            silentGain.connect(ctx.destination);

            // Data Handling
            worklet.port.onmessage = (event) => {
                const { type, data, rmsL, rmsR } = event.data;

                if (type === "level") {
                    setDiagnostics(prev => ({
                        ...prev,
                        micLevel: rmsL,
                        remoteLevel: rmsR
                    }));
                    return;
                }

                if (type === "audio") {
                    setDiagnostics(prev => ({
                        ...prev,
                        micLevel: rmsL,
                        remoteLevel: rmsR
                    }));

                    const f32 = data;
                    const i16 = new Int16Array(f32.length);
                    for (let i = 0; i < f32.length; i++) {
                        let s = Math.max(-1, Math.min(1, f32[i]));
                        i16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }

                    if (wsInstance.current?.readyState === WebSocket.OPEN) {
                        if (Math.random() < 0.01) console.log(`[AudioStream] Sending binary chunk: ${i16.buffer.byteLength} bytes`);
                        wsInstance.current.send(i16.buffer);
                    }
                }
            };

            setIsRecording(true);

        } catch (err: any) {
            console.error("Start Audio Error:", err);
            setError(err.message);
            cleanupAudio();
        }
    };

    const stopAudio = useCallback(() => {
        shouldReconnect.current = false;
        cleanupAudio();
        wsInstance.current?.close();
    }, [cleanupAudio]);

    // Auto-Start
    useEffect(() => {
        if (isHost && meetingId && userId && !isRecording && !audioContextRef.current) {
            const t = setTimeout(() => {
                if (isMounted.current) startAudio();
            }, 1000);
            return () => clearTimeout(t);
        }
    }, [meetingId, userId, isHost]);

    return { isRecording, startAudio, stopAudio, error, transcript, aiSuggestions, diagnostics };
}
