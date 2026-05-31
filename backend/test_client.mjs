
import WebSocket from 'ws';
import crypto from 'crypto';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const sql = postgres(process.env.DATABASE_URL);

async function runTest() {
    console.log("🛠️ Seeding Dummy Call...");

    // Generate IDs
    const customerId = crypto.randomUUID();
    const callId = crypto.randomUUID();

    try {
        // 1. Ensure Customer Exists
        await sql`
            INSERT INTO customers (id, email, name)
            VALUES (${customerId}, 'test_client@example.com', 'Test Client')
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        `;

        // Get the valid ID (either new or existing)
        const actualCustomer = await sql`SELECT id FROM customers WHERE email = 'test_client@example.com'`;
        const actualCustomerId = actualCustomer[0].id;

        // 2. Insert Call
        // Note: Using 'ongoing' status as per schema
        await sql`
            INSERT INTO calls (id, business_owner_id, customer_id, status)
            VALUES (${callId}, 'test-owner-id', ${actualCustomerId}, 'ongoing')
        `;

        console.log("✅ Seeded Call ID:", callId);

    } catch (e) {
        console.error("❌ DB Seed Error:", e);
        // Clean up and exit
        await sql.end();
        process.exit(1);
    }

    // START WEBSOCKET CLIENT
    const ws = new WebSocket('ws://localhost:5000');

    ws.on('open', () => {
        console.log('✅ Connected to Backend');

        // 1. Send Init
        ws.send(JSON.stringify({
            type: 'init',
            call_id: callId
        }));

        // 2. Send Config
        ws.send(JSON.stringify({
            type: 'config',
            mode: 'stereo'
        }));

        // 3. Send Fake Audio
        console.log('🎧 Sending 150 fake audio chunks...');
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 150) {
                clearInterval(interval);
                console.log('🛑 Finishing Audio...');

                // 4. Send End Call Signal
                setTimeout(() => {
                    console.log('📡 Sending End Call Signal...');
                    ws.send(JSON.stringify({ type: 'end_call' }));

                    // Wait for summary to process on backend
                    setTimeout(() => {
                        console.log('🔌 Closing connection...');
                        ws.close();
                        sql.end();
                    }, 3000); // Give backend 3s to process summary
                }, 1000);

                return;
            }

            // Send empty buffer (silence)
            const buffer = Buffer.alloc(1024);
            ws.send(buffer);
            count++;
        }, 30);
    });

    ws.on('message', (data) => {
        console.log('📩 Message from Server:', data.toString());
    });

    ws.on('error', (e) => console.error("WS Error:", e));
    ws.on('close', () => console.log('🔌 Disconnected'));
}

runTest();
