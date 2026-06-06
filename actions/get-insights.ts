'use server';

import { db } from '@/lib/db';
import { customerMemory, calls } from '@/backend/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Sparkles, TrendingUp, AlertTriangle, ThumbsUp } from "lucide-react";

export async function getInsightsData(timestamp?: number) {
    const memories = await db.select().from(customerMemory).orderBy(desc(customerMemory.createdAt)).limit(10);
    
    let insightsList: any[] = [];
    let idCounter = 1;

    for (const mem of memories) {
        let summary = mem.summaryJson as any;
        if (typeof summary === 'string') {
            try { summary = JSON.parse(summary); } catch (e) {}
        }
        if (!summary) continue;

        const timeStr = mem.createdAt 
            ? new Date(mem.createdAt).toLocaleDateString() 
            : "Recent";

        if (summary.objections && Array.isArray(summary.objections)) {
            for (const obj of summary.objections.slice(0, 1)) {
                insightsList.push({
                    id: idCounter++,
                    type: "warning",
                    title: "Objection Detected",
                    description: obj,
                    time: timeStr,
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                });
            }
        }
        
        if (summary.opportunities && Array.isArray(summary.opportunities)) {
            for (const opp of summary.opportunities.slice(0, 1)) {
                insightsList.push({
                    id: idCounter++,
                    type: "success",
                    title: "Opportunity Identified",
                    description: opp,
                    time: timeStr,
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                });
            }
        }

        if (summary.recommendations && Array.isArray(summary.recommendations)) {
            for (const rec of summary.recommendations.slice(0, 1)) {
                insightsList.push({
                    id: idCounter++,
                    type: "tip",
                    title: "Coaching Tip",
                    description: rec,
                    time: timeStr,
                    color: "text-indigo-500",
                    bg: "bg-indigo-50",
                });
            }
        }
    }

    return insightsList.slice(0, 5); // Keep the top 5
}
