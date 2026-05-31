import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/backend/db/schema';

// This is the Next.js-safe database client.
// It does NOT call dotenv.config() — Next.js automatically provides
// DATABASE_URL from .env.local to all server components and actions.

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is missing from .env.local');
}

// Disable prefetch — required for Supabase transaction pooler (port 6543)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
