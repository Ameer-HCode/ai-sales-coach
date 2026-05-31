"use server";

import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { calls } from "@/backend/db/schema";

export async function createCallId() {
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

        return id;
    } catch (error) {
        console.error("Failed to create call record:", error);
        throw new Error("Failed to create meeting");
    }
}
