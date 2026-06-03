"use server";

import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { calls, callContexts } from "@/backend/db/schema";

export async function createCallId(context?: {
    topic: string;
    problem: string;
    solution: string;
    handlingStyle: string;
    previousContext: string;
}) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const id = uuidv4();

    try {
        await db.insert(calls).values({
            id,
            businessOwnerId: userId,
            status: 'ongoing',
            startedAt: new Date(),
        });

        if (context && (context.topic || context.problem || context.solution)) {
            await db.insert(callContexts).values({
                callId: id,
                topic: context.topic,
                problem: context.problem,
                solution: context.solution,
                handlingStyle: context.handlingStyle,
                previousContext: context.previousContext,
            });
        }

        return id;
    } catch (error) {
        console.error("Failed to create call record:", error);
        throw new Error("Failed to create meeting");
    }
}
