import { db } from '@/lib/db';
import { calls, callTranscripts, customerMemory } from '@/backend/db/schema';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, asc } from 'drizzle-orm';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { callId } = await req.json();

        // 1. Verify Ownership & Update Status
        const callUpdate = await db.update(calls)
            .set({ status: 'ended', endedAt: new Date() })
            .where(eq(calls.id, callId)) // Ideally check businessOwnerId too
            .returning({ customerId: calls.customerId });

        if (callUpdate.length === 0) {
            return NextResponse.json({ error: 'Call not found or permission denied' }, { status: 404 });
        }

        const customerId = callUpdate[0].customerId;

        // 2. Fetch All Transcripts
        const transcripts = await db.select()
            .from(callTranscripts)
            .where(eq(callTranscripts.callId, callId))
            .orderBy(asc(callTranscripts.sequence));

        // 3. Build Conversation String
        const conversationText = transcripts.map(t =>
            `[${t.speaker.toUpperCase()}]: ${t.text}`
        ).join('\n');

        if (!conversationText.trim()) {
            return NextResponse.json({ message: "No transcripts to summarize" });
        }

        // 4. Call Groq for Summary
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a sales manager. Analyze the following conversation.
          Return a valid JSON object with these fields:
          {
             "needs": ["list of customer needs"],
             "pain_points": ["list of pains"],
             "objections": ["list of objections"],
             "buying_signals": ["list of signals"],
             "next_steps": ["list of action items"],
             "interest_level": 1 to 10,
             "notes_for_next_call": "Single string summary"
          }`
                },
                { role: "user", content: conversationText }
            ],
            model: "llama3-70b-8192",
            response_format: { type: "json_object" }
        });

        const summaryJsonStr = completion.choices[0]?.message?.content;
        if (!summaryJsonStr) throw new Error("No AI response");

        const summaryData = JSON.parse(summaryJsonStr);

        // 5. Save Memory
        await db.insert(customerMemory).values({
            callId,
            customerId,
            summaryJson: summaryData
        });

        return NextResponse.json({ message: "Call ended and summarized", summary: summaryData });

    } catch (error) {
        console.error("End Call Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
