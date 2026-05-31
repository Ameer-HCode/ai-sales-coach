class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = [];
        this.maxBufferPackets = 50;  // Max ~1.5s buffer (safety)
        this.packetSize = 512;       // 32ms @ 16kHz
        this.silenceThreshold = 0.004;  // Lowered from 0.01 — was cutting off quiet voices
        this.consecutiveSilence = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;

        const channel0 = input[0]; // Left (Mic)
        const channel1 = input.length > 1 ? input[1] : null; // Right (Remote)

        // Calculate RMS for Diagnostics (every frame or accumulated?)
        // Doing it per-block (128 samples) is frequent. We'll do it per-chunk (512 samples).

        // 1. Interleaving Logic
        for (let i = 0; i < channel0.length; i++) {
            const left = channel0[i];
            const right = channel1 ? channel1[i] : left; // Fallback to mono duplicate

            this.buffer.push(left);
            this.buffer.push(right);
        }

        // 2. Packaging Logic (32ms chunks)
        // Stereo: 512 samples/channel * 2 = 1024 samples total
        const TARGET_SIZE = 1024;

        if (this.buffer.length >= TARGET_SIZE) {
            const chunk = this.buffer.slice(0, TARGET_SIZE);
            this.buffer = this.buffer.slice(TARGET_SIZE);

            // 3. RMS Calculation (Split for VAD & UI)
            let sumSqL = 0;
            let sumSqR = 0;

            // Chunk is [L, R, L, R...]
            for (let i = 0; i < chunk.length; i += 2) {
                const l = chunk[i];
                const r = chunk[i + 1];
                sumSqL += l * l;
                sumSqR += r * r;
            }

            const count = chunk.length / 2;
            const rmsL = Math.sqrt(sumSqL / count);
            const rmsR = Math.sqrt(sumSqR / count);

            // 4. VAD (Silence Logic - based on Mic/Left channel mostly?)
            // Usually proper VAD checks the active speaker. 
            // For now, if Mic is silent, we might still want to receive Remote?
            // Actually, for "Sending to Backend", we primarily care if *anyone* is speaking.
            const maxRms = Math.max(rmsL, rmsR);

            if (maxRms < this.silenceThreshold) {
                this.consecutiveSilence++;
                // Allow 25 frames (~750ms) trail before cutting — was 10 frames
                if (this.consecutiveSilence > 25) {
                    // Still send RMS update for UI even if we drop audio?
                    // Yes, UI needs to know silence.
                    this.port.postMessage({ type: "level", rmsL, rmsR });
                    return true;
                }
            } else {
                this.consecutiveSilence = 0;
            }

            // 5. Send Audio + Levels
            this.port.postMessage({
                type: "audio",
                data: chunk,
                rmsL,
                rmsR
            });
        }

        // 6. Safety Valve (Burst Protection)
        if (this.buffer.length > 32000) {
            this.buffer = this.buffer.slice(this.buffer.length - 16000);
        }

        return true;
    }
}

registerProcessor("audio-processor", AudioProcessor);
