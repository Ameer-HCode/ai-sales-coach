"use client";

import { useEffect, useRef, useState } from "react";


interface AudioStreamHook {
    isRecording: boolean;
    startAudio: () => Promise<void>;
    stopAudio: () => void;
    error: string | null;
    transcript: string;
}

export function useAudioStream(meetingId: string, userId: string, participantCount: number): AudioStreamHook {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>("");

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Auto-start validation Ref
    const hasAttemptedStart = useRef(false);
    // Connection throttle ref
    const lastConnectionAttemptRef = useRef<number>(0);

    // Ref for participant count to access fresh value inside callbacks
    const participantCountRef = useRef(participantCount);
    useEffect(() => {
        participantCountRef.current = participantCount;
    }, [participantCount]);

    // Mounting Guard
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const startAudio = async () => {
        if (isRecording || !isMounted.current) return; // Prevent double start or start when unmounted

        // Loop Breaker: 500ms debounce
        if (Date.now() - (lastConnectionAttemptRef.current || 0) < 1000) {
            console.warn("[Audio] Connection throttled to prevent loop.");
            return;
        }
        lastConnectionAttemptRef.current = Date.now();

        setError(null);
        try {
            console.log("[Audio] Attempting connection...");

            // 1. Connect to WebSocket
            // Dynamic URL selection:
            // - Localhost: Direct connection to ws://localhost:5000
            // - Remote (Ngrok): Use the secure WebSocket tunnel (Ngrok upgrades HTTPS -> WSS)
            const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            // Priority:
            // 1. Environment Variable (Remote/Tunnel)
            // 2. Localhost Fallback
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || (isLocal ? "ws://localhost:5000" : "");

            if (!wsUrl) {
                console.error("[Audio] No WebSocket URL configured. Set NEXT_PUBLIC_WS_URL in .env.local");
                setError("Configuration Error: Missing WebSocket URL");
                return;
            }

            console.log(`[Audio Debug] Hostname: ${window.location.hostname}`);
            console.log(`[Audio Debug] Connecting to WS URL: ${wsUrl}`);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            await new Promise<void>((resolve, reject) => {
                ws.onopen = () => {
                    if (!isMounted.current) {
                        ws.close();
                        return;
                    }
                    console.log("[Audio] WebSocket Connected");
                    resolve();
                };

                ws.onerror = (event) => {
                    if (!isMounted.current) return;
                    console.error("[Audio] WebSocket Error:", event);
                    reject(new Error("WebSocket connection error. Check if backend is reachable."));
                };

                // Handle Incoming Transcripts
                ws.onmessage = (event) => {
                    if (!isMounted.current) return;
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === "transcript") {
                            // Log to Console as requested by User
                            console.log(`%c[AI Ear] ${data.is_final ? "✅" : "⚡"} ${data.text}`, data.is_final ? "color: green; font-weight: bold;" : "color: gray;");

                            // Update State for UI
                            // For live captions, we want to see the text evolving.
                            setTranscript(data.text);
                        }
                    } catch (err) {
                        console.error("Failed to parse incoming WS message", err);
                    }
                };
            });

            // Check mounting again after await
            if (!isMounted.current) throw new Error("Component unmounted during setup");

            // 2. Setup Audio Context & Mic
            // IMPORTANT: Resume context if suspended (browser auto-play policy)
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            audioContextRef.current = audioContext;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Use 16kHz context as preferred by many Speech APIs
            try {
                // Ensure absolute URL to prevent 404s or cors issues on some browsers
                const workletUrl = new URL("/audio-processor.js", window.location.origin).toString();
                console.log("[Audio] Loading Worklet from:", workletUrl);
                await audioContext.audioWorklet.addModule(workletUrl);
            } catch (e: any) {
                console.error("Failed to load audio-processor.js", e);
                // If the worklet fails, we cannot process audio. Abort.
                throw new Error(`Failed to load audio processor: ${e.message}`);
            }

            const source = audioContext.createMediaStreamSource(stream);
            sourceNodeRef.current = source;

            const worklet = new AudioWorkletNode(audioContext, "audio-processor");
            workletNodeRef.current = worklet;

            // 3. Pipeline: Mic -> Worklet -> Destination (Muted to prevent feedback)
            worklet.port.onmessage = (event) => {
                const audioBuffer = event.data; // Float32Array

                if (ws.readyState === WebSocket.OPEN) {
                    // Check Logic: Only send if > 1 participant
                    if (participantCountRef.current > 1) {
                        ws.send(JSON.stringify({
                            meetingId,
                            userId,
                            audio: Array.from(audioBuffer)
                        }));
                    }
                }
            };

            source.connect(worklet);
            worklet.connect(audioContext.destination);

            if (isMounted.current) setIsRecording(true);
            console.log("[Audio] Streaming active");

        } catch (err: any) {
            if (!isMounted.current) return;
            console.error("Error starting audio stream:", err);
            setError(err.message || "Unknown error");
            stopAudio();
        }
    };

    const stopAudio = () => {
        if (isMounted.current) setIsRecording(false);
        hasAttemptedStart.current = false;

        // Close WS
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Stop Audio
        if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
        if (workletNodeRef.current) workletNodeRef.current.disconnect();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();

        sourceNodeRef.current = null;
        workletNodeRef.current = null;
        streamRef.current = null;
        audioContextRef.current = null;
    };

    useEffect(() => {
        // Auto-start on mount
        console.log(`[Audio Hook Effect] Running. meetingId=${meetingId}, userId=${userId}, hasAttempted=${hasAttemptedStart.current}`);
        if (!hasAttemptedStart.current && meetingId && userId) {
            hasAttemptedStart.current = true;
            // Small delay to ensure render stability before starting heavy audio work
            setTimeout(() => {
                if (isMounted.current) startAudio();
            }, 500);
        }

        return () => {
            stopAudio();
        };
    }, [meetingId, userId]);

    return { isRecording, startAudio, stopAudio, error, transcript };
}
