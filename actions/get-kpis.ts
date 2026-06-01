'use server';

import { db } from '@/lib/db';
import { calls, customerMemory } from '@/backend/db/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';
import { Phone, CheckCircle2, Clock, Lightbulb } from "lucide-react";

export async function getKpisData(timestamp?: number) {
    
    // 1. Total Calls Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCalls = await db.select().from(calls).where(gte(calls.startedAt, today));
    
    // 2. Deals Closed (completed calls)
    const closedCalls = await db.select().from(calls).where(eq(calls.status, 'ended'));

    // 3. Avg Call Duration
    const allEndedCalls = await db.select().from(calls).where(eq(calls.status, 'ended'));
    let totalDurationMs = 0;
    let durationCount = 0;
    for (const c of allEndedCalls) {
        if (c.startedAt && c.endedAt) {
            totalDurationMs += c.endedAt.getTime() - c.startedAt.getTime();
            durationCount++;
        }
    }
    const avgDurationMs = durationCount > 0 ? totalDurationMs / durationCount : 0;
    const avgMinutes = Math.floor(avgDurationMs / 60000);
    const avgSeconds = Math.floor((avgDurationMs % 60000) / 1000);
    const durationStr = durationCount > 0 ? `${avgMinutes}m ${avgSeconds}s` : "0m 0s";

    // 4. AI Suggestions (number of memories generated or total AI tips)
    const memories = await db.select().from(customerMemory);
    let totalSuggestions = 0;
    for (const m of memories) {
        const s = m.summaryJson as any;
        if (s && s.recommendations) {
            totalSuggestions += s.recommendations.length;
        }
    }

    return [
        {
            title: "Total Calls Today",
            value: todayCalls.length.toString(),
            description: "Active & ended calls",
            iconName: "Phone",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Completed Calls",
            value: closedCalls.length.toString(),
            description: "Successfully processed",
            iconName: "CheckCircle2",
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            title: "Avg Call Duration",
            value: durationStr,
            description: "For completed calls",
            iconName: "Clock",
            color: "text-amber-600",
            bgColor: "bg-amber-100",
        },
        {
            title: "AI Coaching Tips",
            value: totalSuggestions.toString(),
            description: "Generated from transcripts",
            iconName: "Lightbulb",
            color: "text-indigo-600",
            bgColor: "bg-indigo-100",
        },
    ];
}
