import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

// Create a standalone HTTP server for the Upgrade requests
const server = createServer();
const wss = new WebSocketServer({ server });

const PORT = 3001; // Run on port 3001, distinct from Next.js (3000)

console.log(`Starting WebSocket Relay on port ${PORT}...`);

wss.on('connection', (ws: WebSocket, req) => {
    console.log(`New Client Connected from ${req.socket.remoteAddress}`);

    ws.on('message', (message) => {
        // Relay logic:
        // 1. Parse message (Audio data)
        // 2. Forward to AssemblyAI (Future step)
        // 3. For now, just echo or log size

        try {
            const data = JSON.parse(message.toString());
            if (data.audio) {
                // console.log(`Received audio chunk: ${data.audio.length} bytes`);
                // Simulate processing...

                // Echo back for now (verification)
                // ws.send(JSON.stringify({ type: 'ack', size: data.audio.length }));
            }
        } catch (err) {
            console.error('Error parsing message:', err);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`✅ WebSocket Relay listening on ws://localhost:${PORT}`);
});
