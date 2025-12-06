// public/audio-processor.js

class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096; // Buffer size to process
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        // Input is an array of channels (we only care about the first one for mono)
        const input = inputs[0];
        if (!input || input.length === 0) return true;

        const inputChannel = input[0];

        // Simple buffering: Accumulate samples until we hit bufferSize
        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex++] = inputChannel[i];

            // If buffer is full, flush it to the main thread
            if (this.bufferIndex === this.bufferSize) {
                this.port.postMessage(this.buffer); // Check: Send as Float32Array (copy)
                this.bufferIndex = 0;
            }
        }

        return true; // Keep processor alive
    }
}

registerProcessor("audio-processor", AudioProcessor);
