import asyncio
import websockets
import json
import assemblyai as aai
from dotenv import load_dotenv
import os

# Load env variables (API Key)
load_dotenv(dotenv_path=".env.local")

# Set API Key from environment only
api_key = os.getenv("ASSEMBLYAI_API_KEY")
if not api_key:
    raise ValueError("ASSEMBLYAI_API_KEY not found in .env.local file. Please add it.")

aai.settings.api_key = api_key

PORT = 5000

print(f"Starting Python WebSocket Server on port {PORT}...")

async def handle_audio_stream(websocket):
    print(f"New Client Connected!")
    
    # 1. Define Callback Functions
    def on_open(session_opened: aai.RealtimeSessionOpened):
        print("AssemblyAI Session ID:", session_opened.session_id)

    def on_data(transcript: aai.RealtimeTranscript):
        if not transcript.text:
            return

        if isinstance(transcript, aai.RealtimeFinalTranscript):
            print(f"✅ Final: {transcript.text}")
            asyncio.run_coroutine_threadsafe(websocket.send(json.dumps({
                "type": "transcript",
                "text": transcript.text,
                "is_final": True
            })), loop)
        else:
            print(f"Wait: {transcript.text}", end="\r")
            asyncio.run_coroutine_threadsafe(websocket.send(json.dumps({
                "type": "transcript",
                "text": transcript.text,
                "is_final": False
            })), loop)

    def on_error(error: aai.RealtimeError):
        print("An error occurred:", error)

    def on_close():
        print("Closing AssemblyAI Session")

    # 2. Initialize AssemblyAI RealTimeTranscriber
    # RESTORED: Minimal params to use Universal Streaming (v3 implies no legacy params)
    transcriber = aai.RealtimeTranscriber(
        sample_rate=16000,
        on_data=on_data,
        on_error=on_error,
        on_open=on_open,
        on_close=on_close
    )

    # 3. Connect logic...
    transcriber.connect()

    # 5. Microphone Stream Loop
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                if "audio" in data:
                    # 'audio' is likely an array of numbers (or base64)
                    audio_data = bytes(data["audio"])
                    transcriber.stream(audio_data)
                    
            except json.JSONDecodeError:
                print("Invalid JSON received")
            except Exception as e:
                print(f"Error processing message: {e}")

    except websockets.exceptions.ConnectionClosed:
        print("Client Disconnected")
    finally:
        transcriber.close()
        print("Closing AssemblyAI Session")

async def main():
    async with websockets.serve(handle_audio_stream, "localhost", PORT):
        print(f"✅ Server running on ws://localhost:{PORT}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        pass
