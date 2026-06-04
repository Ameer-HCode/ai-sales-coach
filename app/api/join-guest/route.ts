import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callParticipants, customers, calls } from "@/backend/db/schema";
import { tokenProvider } from "@/actions/stream";
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, callId } = body;

        if (!name || !email || !callId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const userId = uuidv4();

        // 1. Handle Customer Record (Long-term memory linking)
        let customerRecord = await db.query.customers.findFirst({
            where: (customers, { eq }) => eq(customers.email, email)
        });

        if (!customerRecord) {
            const inserted = await db.insert(customers).values({
                email,
                name
            }).returning();
            customerRecord = inserted[0];
        }

        // 2. Link Customer to Call
        await db.update(calls)
            .set({ 
                customerId: customerRecord.id,
                customerEmail: email 
            })
            .where(eq(calls.id, callId));

        // 3. Store Participant in DB
        await db.insert(callParticipants).values({
            callId,
            name,
            email,
            role: 'guest',
        });

        // 2. Generate Stream Token
        // NOTE: tokenProvider normally takes a Clerk ID or arbitrary string.
        // We pass our generated UUID.
        const token = await tokenProvider(userId);

        return NextResponse.json({
            token,
            userId,
            name,
            email
        });

    } catch (error: any) {
        console.error("Error joining as guest:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
