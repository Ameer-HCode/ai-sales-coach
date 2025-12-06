import asyncio
import websockets
import json
import os
import pathlib
import assemblyai as aai
from dotenv import load_dotenv

# Load env from "backend/.env" explicitly
current_dir = pathlib.Path(__file__).parent.resolve()
env_path = current_dir / ".env"

if not env_path.exists():
    print(f"⚠️ Warning: .env file not found at {env_path}")

load_dotenv(dotenv_path=env_path)
API_KEY = os.getenv("ASSEMBLYAI_API_KEY")

if not API_KEY:
    raise ValueError(f"ASSEMBLYAI_API_KEY not found in {env_path}. Please add it.")

# Configure AssemblyAI
aai.settings.api_key = API_KEY

PORT = 5000

print(f"Starting SDK-based WebSocket Server on port {PORT}...")

async def handle_audio_stream(client_ws):
    print("New Client Connected!")
    loop = asyncio.get_running_loop()
    
    # Callback to handle transcripts from AssemblyAI
    def on_data(transcript: aai.RealtimeTranscript):
        if not transcript.text:
            return

        # Prepare message for frontend
        msg = {
            "type": "transcript",
            "text": transcript.text,
            "is_final": isinstance(transcript, aai.RealtimeFinalTranscript)
        }
        
        # Log to server console
        prefix = "✅ Final" if msg["is_final"] else "⚡ Partial"
        print(f"{prefix}: {transcript.text}")

        # Send to client (thread-safe bridging to asyncio loop)
        asyncio.run_coroutine_threadsafe(
            client_ws.send(json.dumps(msg)), 
            loop
        )

    def on_error(error: aai.RealtimeError):
        print(f"❌ AssemblyAI Error: {error}")

    def on_close():
        print("AssemblyAI Connection Closed")

    # Initialize RealtimeTranscriber
    transcriber = aai.RealtimeTranscriber(
        on_data=on_data,
        on_error=on_error,
        on_close=on_close,
        sample_rate=16000,
        word_boost=[], # Add domain specific words here if needed
    )

    # Start the connection
    try:
        transcriber.connect()
        print("✅ Connected to AssemblyAI (SDK)")
    except Exception as e:
        print(f"Failed to connect to AssemblyAI: {e}")
        await client_ws.close()
        return

    try:
        async for message in client_ws:
            data = json.loads(message)
            if "audio" in data:
                # Get Float32 array from client
                floats = data["audio"]
                
                # Convert Float32 [-1, 1] -> Int16 bytes
                # The SDK expects 'bytes' or 'bytearray' of PCM16 audio
                import struct
                pcm16 = b''.join(
                    struct.pack('<h', int(max(-1, min(1, f)) * 32767))
                    for f in floats
                )
                
                # Stream to AssemblyAI
                transcriber.stream(pcm16)
                
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Error handling audio stream: {e}")
    finally:
        transcriber.close()
        print("Cleaned up transcriber")

async def main():
    async with websockets.serve(handle_audio_stream, "0.0.0.0", PORT):
        print(f"✅ Server running on ws://0.0.0.0:{PORT}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
