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

    // Ref for participant count to access fresh value inside callbacks
    const participantCountRef = useRef(participantCount);
    useEffect(() => {
        participantCountRef.current = participantCount;
    }, [participantCount]);

    const startAudio = async () => {
        if (isRecording) return; // Prevent double start
        setError(null);
        try {
            console.log("[Audio] Attempting connection...");

            // 1. Connect to WebSocket
            // UPDATED STRATEGY: Use Relative URL via Next.js Proxy
            // This reuses the main Cloudflare tunnel (no separate port needed)
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = `${protocol}//${window.location.host}/api/ws`;

            console.log(`[Audio] Connecting to: ${wsUrl}`);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            await new Promise<void>((resolve, reject) => {
                ws.onopen = () => {
                    console.log("[Audio] WebSocket Connected");
                    resolve();
                };

                ws.onerror = (event) => {
                    console.error("[Audio] WebSocket Error:", event);
                    // Attempt to extract useful error info if possible (WS errors are notoriously vague in JS)
                    reject(new Error("WebSocket connection error. Check if backend is reachable."));
                };

                // Handle Incoming Transcripts
                ws.onmessage = (event) => {
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

            // 2. Setup Audio Context & Mic
            // IMPORTANT: Resume context if suspended (browser auto-play policy)
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            audioContextRef.current = audioContext;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Use 16kHz context as preferred by many Speech APIs (AssemblyAI supports others, but 16kHz is standard)
            try {
                await audioContext.audioWorklet.addModule("/audio-processor.js");
            } catch (e) {
                console.error("Failed to load audio-processor.js", e);
                // Fallback or retry logic could go here
                throw e;
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

            setIsRecording(true);
            console.log("[Audio] Streaming active");

        } catch (err: any) {
            console.error("Error starting audio stream:", err);
            setError(err.message || "Unknown error");
            stopAudio();
        }
    };

    const stopAudio = () => {
        setIsRecording(false);
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
        if (!hasAttemptedStart.current && meetingId && userId) {
            hasAttemptedStart.current = true;
            startAudio();
        }

        return () => {
            stopAudio();
        };
    }, [meetingId, userId]);

    return { isRecording, startAudio, stopAudio, error, transcript };
}
