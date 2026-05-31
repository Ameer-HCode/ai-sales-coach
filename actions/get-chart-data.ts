'use server';

import { db } from '@/lib/db';
import { calls } from '@/backend/db/schema';
import { gte } from 'drizzle-orm';

export async function getChartData() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Get calls from the last 7 days
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);
    lastWeek.setHours(0, 0, 0, 0);

    const recentCalls = await db.select().from(calls).where(gte(calls.startedAt, lastWeek));

    // Initialize data array for the last 7 days ending today
    const dataMap = new Map<string, { calls: number, deals: number }>();
    for (let i = 0; i < 7; i++) {
        const d = new Date(lastWeek);
        d.setDate(lastWeek.getDate() + i);
        dataMap.set(days[d.getDay()], { calls: 0, deals: 0 });
    }

    // Populate data
    for (const call of recentCalls) {
        if (!call.startedAt) continue;
        const dayStr = days[call.startedAt.getDay()];
        if (dataMap.has(dayStr)) {
            const data = dataMap.get(dayStr)!;
            data.calls += 1;
            if (call.status === 'ended') {
                data.deals += 1;
            }
        }
    }

    // Convert map to array in chronological order (from 6 days ago to today)
    const result = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(lastWeek);
        d.setDate(lastWeek.getDate() + i);
        const dayStr = days[d.getDay()];
        result.push({
            name: dayStr,
            calls: dataMap.get(dayStr)!.calls,
            deals: dataMap.get(dayStr)!.deals,
        });
    }

    return result;
}
