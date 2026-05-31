import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callParticipants } from "@/backend/db/schema";
import { tokenProvider } from "@/actions/stream";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, callId } = body;

        if (!name || !email || !callId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const userId = uuidv4();

        // 1. Store Participant in DB
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
