import * as dotenv from 'dotenv';
dotenv.config({ path: ".env.local" });

// Load db AFTER dotenv config
const { db } = require('./lib/db');
const { sql } = require('drizzle-orm');

async function run() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS call_contexts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
        topic TEXT,
        problem TEXT,
        solution TEXT,
        handling_style TEXT,
        previous_context TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table created successfully!");
    process.exit(0);
  } catch (e) {
    console.error("Error creating table:", e);
    process.exit(1);
  }
}
run();
