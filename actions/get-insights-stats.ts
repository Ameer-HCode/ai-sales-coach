'use server';

import { db } from '@/lib/db';
import { customerMemory, callTranscripts } from '@/backend/db/schema';
import { desc } from 'drizzle-orm';

export async function getInsightsStats() {
    const memories = await db.select().from(customerMemory);
    
    // Total Analysis
    const totalAnalysis = memories.length;

    // Coaching Tips
    let totalTips = 0;
    for (const m of memories) {
        const s = m.summaryJson as any;
        if (s && s.recommendations) {
            totalTips += s.recommendations.length;
        }
    }

    // Sentiment Score (just a simulated one based on tips and objections if not directly available)
    let score = 8.5;
    if (totalAnalysis > 0) {
        // Mocked real score logic: start at 10, subtract 0.5 for every objection per call
        let totalObjections = 0;
        for (const m of memories) {
            const s = m.summaryJson as any;
            if (s && s.objections) {
                totalObjections += s.objections.length;
            }
        }
        const avgObjections = totalObjections / totalAnalysis;
        score = Math.max(0, 10 - (avgObjections * 0.5));
    }

    return {
        totalAnalysis: totalAnalysis.toString(),
        totalAnalysisTrend: "+0.0% from last month",
        sentimentScore: score.toFixed(1) + "/10",
        sentimentTrend: "+0.0 from last week",
        coachingTips: totalTips.toString(),
        coachingTipsTrend: "Generated from transcripts"
    };
}
