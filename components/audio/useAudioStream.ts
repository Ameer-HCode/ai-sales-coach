"use client";

import { useEffect, useRef, useState } from "react";

interface AudioStreamHook {
    isRecording: boolean;
    startAudio: () => Promise<void>;
    stopAudio: () => void;
    error: string | null;
}

export function useAudioStream(meetingId: string, userId: string): AudioStreamHook {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Auto-start validation Ref
    const hasAttemptedStart = useRef(false);

    const startAudio = async () => {
        if (isRecording) return; // Prevent double start
        setError(null);
        try {
            console.log("[Audio] Attempting connection...");

            // 1. Connect to WebSocket
            // Note: In PROD, use secure wss:// and proper environment variable
            const wsUrl = "ws://localhost:3001";
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            await new Promise<void>((resolve, reject) => {
                ws.onopen = () => {
                    console.log("[Audio] WebSocket Connected");
                    resolve();
                };
                ws.onerror = (err) => {
                    console.error("[Audio] WS Error", err);
                    reject(new Error("Failed to connect to WebSocket"));
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
            // Note: Browsers might enforce their own sample rate (e.g. 44.1 or 48kHz).
            // The AudioWorklet will handle processing.

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

                // Convert Float32 to Int16 (PCM) if deemed efficient, 
                // OR send Float32 and convert on server. 
                // For now, let's send chunks as is.

                if (ws.readyState === WebSocket.OPEN) {
                    // Send structure
                    ws.send(JSON.stringify({
                        meetingId,
                        userId,
                        audio: Array.from(audioBuffer) // Naive encoding for MVP. Binary is better.
                    }));
                }
            };

            source.connect(worklet);
            worklet.connect(audioContext.destination); // Required to keep graph alive, but might hear self? No, worklet output goes to destination. if Processor outputs nothing, it's silent.

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

    return { isRecording, startAudio, stopAudio, error };
}
