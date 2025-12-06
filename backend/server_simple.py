import asyncio
import websockets
import json
import os
from dotenv import load_dotenv

# Load env
load_dotenv(dotenv_path=".env.local")
API_KEY = os.getenv("ASSEMBLYAI_API_KEY")

if not API_KEY:
    raise ValueError("ASSEMBLYAI_API_KEY not found in .env.local file. Please add it.")

PORT = 5000
ASSEMBLYAI_URL = f"wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token={API_KEY}"

print(f"Starting Simple WebSocket Server on port {PORT}...")

async def handle_audio_stream(client_ws):
    print("New Client Connected!")
    
    # Connect to AssemblyAI
    try:
        async with websockets.connect(ASSEMBLYAI_URL) as aai_ws:
            print("✅ Connected to AssemblyAI")
            
            async def forward_to_aai():
                """Forward audio from client to AssemblyAI"""
                try:
                    async for message in client_ws:
                        data = json.loads(message)
                        if "audio" in data:
                            # Convert array to bytes and send to AssemblyAI
                            audio_bytes = bytes(data["audio"])
                            await aai_ws.send(audio_bytes)
                except websockets.exceptions.ConnectionClosed:
                    print("Client disconnected")
            
            async def forward_to_client():
                """Forward transcripts from AssemblyAI to client"""
                try:
                    async for message in aai_ws:
                        data = json.loads(message)
                        if data.get("message_type") == "FinalTranscript":
                            transcript_text = data.get("text", "")
                            print(f"✅ Final: {transcript_text}")
                            await client_ws.send(json.dumps({
                                "type": "transcript",
                                "text": transcript_text,
                                "is_final": True
                            }))
                        elif data.get("message_type") == "PartialTranscript":
                            transcript_text = data.get("text", "")
                            print(f"⚡ Partial: {transcript_text}", end="\r")
                            await client_ws.send(json.dumps({
                                "type": "transcript",
                                "text": transcript_text,
                                "is_final": False
                            }))
                except websockets.exceptions.ConnectionClosed:
                    print("AssemblyAI disconnected")
            
            # Run both forwarding tasks concurrently
            await asyncio.gather(
                forward_to_aai(),
                forward_to_client()
            )
    
    except Exception as e:
        print(f"Error: {e}")
    finally:
        print("Connection closed")

async def main():
    async with websockets.serve(handle_audio_stream, "localhost", PORT):
        print(f"✅ Server running on ws://localhost:{PORT}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
