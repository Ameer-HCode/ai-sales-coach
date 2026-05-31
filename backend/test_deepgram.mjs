import { createClient } from "@deepgram/sdk";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

async function test() {
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: "https://dpgr.am/spacewalk.wav" },
      { model: "nova-2" }
    );
    if (error) {
      console.error("Deepgram Error:", error);
    } else {
      console.dir(result, { depth: null });
      console.log("SUCCESS!");
    }
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
