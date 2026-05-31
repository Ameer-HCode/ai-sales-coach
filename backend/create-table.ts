import postgres from 'postgres';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
}

const sql = postgres(connectionString);

async function main() {
    console.log('Creating call_participants table...');

    await sql`
        CREATE TABLE IF NOT EXISTS "customers" (
            "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            "email" TEXT UNIQUE NOT NULL,
            "name" TEXT,
            "created_at" TIMESTAMP DEFAULT NOW()
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS "calls" (
            "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            "business_owner_id" TEXT NOT NULL,
            "customer_id" UUID REFERENCES "customers"("id"),
            "customer_email" TEXT,
            "started_at" TIMESTAMP DEFAULT NOW(),
            "ended_at" TIMESTAMP,
            "status" TEXT DEFAULT 'ongoing'
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS "call_participants" (
            "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            "call_id" UUID NOT NULL REFERENCES "calls"("id"),
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "role" TEXT NOT NULL,
            "joined_at" TIMESTAMP DEFAULT NOW()
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS "call_transcripts" (
            "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            "call_id" UUID NOT NULL REFERENCES "calls"("id"),
            "speaker" TEXT NOT NULL,
            "text" TEXT NOT NULL,
            "timestamp_ms" BIGINT NOT NULL,
            "sequence" INTEGER NOT NULL,
            "created_at" TIMESTAMP DEFAULT NOW()
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS "customer_memory" (
            "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            "call_id" UUID REFERENCES "calls"("id"),
            "customer_id" UUID REFERENCES "customers"("id"),
            "summary_json" JSONB NOT NULL,
            "created_at" TIMESTAMP DEFAULT NOW()
        );
    `;

    console.log('✅ Table call_participants created successfully.');
    process.exit(0);
}

main().catch((err) => {
    console.error('Error creating table:', err);
    process.exit(1);
});
