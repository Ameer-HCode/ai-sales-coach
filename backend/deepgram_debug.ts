
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const apiKey = process.env.DEEPGRAM_API_KEY;
console.log("🔑 API KEY Length:", apiKey ? apiKey.length : "MISSING");

if (!apiKey) {
    console.error("❌ No API Key found");
    process.exit(1);
}

const deepgram = createClient(apiKey);

const live = deepgram.listen.live({
    model: "nova-2",
    smart_format: true,
    encoding: "linear16",
    sample_rate: 16000,
    channels: 1
});

live.on(LiveTranscriptionEvents.Open, () => {
    console.log("✅ Deepgram Connection OPEN");

    // Send some silence to keep it happy
    const silence = Buffer.alloc(1000);
    live.send(silence.buffer);
    console.log("Sent silence frame");

    setTimeout(() => {
        console.log("Closing...");
        live.finish();
    }, 2000);
});

live.on(LiveTranscriptionEvents.Close, (data) => {
    console.log("🔌 Connection CLOSED", data);
});

live.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("❌ Connection ERROR:", err);
});

console.log("⏳ Connecting to Deepgram...");
