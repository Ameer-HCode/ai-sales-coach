# AI Sales Coach (Production-Grade)

A real-time AI Sales Coach application featuring **Live Audio Intelligence**, **Real-Time Transcription**, and **Instant Coaching Suggestions**. Built for high-performance sales environments with sub-500ms latency.

## 🚀 Key Features

### 🧠 Real-Time AI Coaching
- **Live Transcription**: Powered by **Deepgram Nova-2** for ultra-fast, high-accuracy speech-to-text.
- **Instant AI Hints**: Integrated with **Groq (Llama 3-70B)** to analyze customer objections and provide instantaneous (<150ms) coaching tips.
- **Persistent Suggestions Panel**: A chat-style history of all AI coaching tips, auto-scrolling and timestamped.

### ⚡ Production-Grade Audio Pipeline
- **Custom AudioWorklet**: specialized `audio-processor.js` for raw PCM16 audio capture, interleaving, and silence filtering (VAD).
- **Stereo & Mono Support**:
  - **Stereo Mode**: For 1-on-1 calls (Left=Rep, Right=Customer).
  - **Mono Diarization**: Automatically switches for 3+ participants to handle multi-speaker attribution.
- **Robust WebSocket Relay**: Node.js backend with per-frame binary forwarding, burst protection, and connection heartbeat.
- **Exponential Backoff**: Resilient frontend reconnection logic (500ms → 10s) to handle network drops.

### 🎥 Complete Audio & Video Calling
- **Stream Video SDK**: High-quality WebRTC video/audio conferencing.
- **Google Meet-Inspired UI**: Professional grid layouts, screen sharing, and device management.
- **Real-Time Diagnostics**: On-screen overlay showing Mic levels, connection state, and E2E latency (STT + AI + Network).

### 🛠️ Architecture Highlights
- **Frontend**: Next.js 14, TypeScript, Stream SDK, Custom Web Audio API Hooks.
- **Backend**: Node.js WebSocket Server, Deepgram SDK, Groq SDK.
- **Latency**: Optimized for <500ms total loop time (Speech → Text → AI → UI).

## Getting Started

### 1. Environment Setup
Create a `.env` file in `backend/` and `root`:

```env
# Backend
DEEPGRAM_API_KEY=your_deepgram_key
GROQ_API_KEY=your_groq_key

# Frontend
NEXT_PUBLIC_STREAM_API_KEY=your_stream_key
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### 2. Run the Backend relay
```bash
cd backend
npm install
npx tsx server.ts
```

### 3. Run the Frontend
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start a call.

## Tech Stack
- **Next.js 14+** (App Router)
- **Node.js WebSocket Server**
- **Deepgram Nova-2** (Streaming STT)
- **Groq Llama 3** (AI Analysis)
- **Stream Video SDK** (WebRTC)
- **Tailwind CSS & Shadcn/UI**
