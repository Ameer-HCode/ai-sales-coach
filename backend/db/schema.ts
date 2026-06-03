import { pgTable, text, timestamp, uuid, jsonb, integer, bigint, boolean } from 'drizzle-orm/pg-core';

// 1. Customers (Prospects) - Not authenticated, just email/name
export const customers = pgTable('customers', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique().notNull(), // To link future calls
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 2. Calls - The main session record
export const calls = pgTable('calls', {
    id: uuid('id').defaultRandom().primaryKey(), // call_id
    businessOwnerId: text('business_owner_id').notNull(), // Clerk User ID (Rep)
    customerId: uuid('customer_id').references(() => customers.id),
    customerEmail: text('customer_email'), // Redundant but useful snapshot
    startedAt: timestamp('started_at').defaultNow(),
    endedAt: timestamp('ended_at'),
    status: text('status').default('ongoing'), // 'ongoing', 'ended', 'dropped'
});

// 3. Call Transcripts - Storing every final segment for safety
export const callTranscripts = pgTable('call_transcripts', {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    callId: uuid('call_id').references(() => calls.id).notNull(),
    speaker: text('speaker').notNull(), // 'rep' | 'customer'
    text: text('text').notNull(),
    timestampMs: bigint('timestamp_ms', { mode: 'number' }).notNull(), // Offset from start
    sequence: integer('sequence').notNull(), // 1, 2, 3...
    createdAt: timestamp('created_at').defaultNow(),
});

// 4. Customer Memory (Summaries) - AI insights for next time
export const customerMemory = pgTable('customer_memory', {
    id: uuid('id').defaultRandom().primaryKey(),
    callId: uuid('call_id').references(() => calls.id),
    customerId: uuid('customer_id').references(() => customers.id),
    summaryJson: jsonb('summary_json').notNull(), // The Groq AI summary
    createdAt: timestamp('created_at').defaultNow(),
});

// 5. Call Participants (Guests) - For strict tracking of who joined
export const callParticipants = pgTable('call_participants', {
    id: uuid('id').defaultRandom().primaryKey(),
    callId: uuid('call_id').references(() => calls.id).notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: text('role').notNull(), // 'host' | 'guest'
    joinedAt: timestamp('joined_at').defaultNow(),
});

// 6. Pre-Call AI Briefing Context - For specific meeting AI customization
export const callContexts = pgTable('call_contexts', {
    id: uuid('id').defaultRandom().primaryKey(),
    callId: uuid('call_id').references(() => calls.id).notNull(),
    topic: text('topic'),
    problem: text('problem'),
    solution: text('solution'),
    handlingStyle: text('handling_style'),
    previousContext: text('previous_context'),
    createdAt: timestamp('created_at').defaultNow(),
});
