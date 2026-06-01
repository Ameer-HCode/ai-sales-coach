'use server';

import { db } from '@/lib/db';
import { calls, customers, customerMemory, callParticipants } from '@/backend/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function getCallsData(timestamp?: number) {
    const allCalls = await db.select().from(calls).orderBy(desc(calls.startedAt)).limit(15);
    
    const formattedCalls = [];
    for (const c of allCalls) {
        let customerName = "Unknown Customer";
        if (c.customerId) {
            const cust = await db.select().from(customers).where(eq(customers.id, c.customerId)).limit(1);
            if (cust.length > 0) {
                customerName = cust[0].name || cust[0].email;
            }
        } else if (c.customerEmail) {
            customerName = c.customerEmail;
        }

        const participantsRaw = await db.select().from(callParticipants).where(eq(callParticipants.callId, c.id));
        const participants = participantsRaw.length > 0 
            ? participantsRaw.map(p => ({ name: p.name, img: "", fallback: p.name.substring(0, 2).toUpperCase() }))
            : [{ name: "Rep", img: "", fallback: "RP" }, { name: customerName, img: "", fallback: customerName.substring(0, 2).toUpperCase() }];

        let duration = "0 min";
        if (c.startedAt && c.endedAt) {
            const diffMs = c.endedAt.getTime() - c.startedAt.getTime();
            const minutes = Math.floor(diffMs / 60000);
            const seconds = Math.floor((diffMs % 60000) / 1000);
            duration = `${minutes}m ${seconds}s`;
        } else if (c.status === 'ongoing') {
            duration = "Ongoing";
        }

        const dateFormatted = c.startedAt ? new Date(c.startedAt).toLocaleString() : "Unknown";

        // Check for memory
        const memory = await db.select().from(customerMemory).where(eq(customerMemory.callId, c.id)).limit(1);
        let status = c.status === 'ended' ? 'Completed' : (c.status === 'ongoing' ? 'Negotiation' : 'Missed');
        
        const summaryJson = memory.length > 0 ? (memory[0].summaryJson as any) : null;
        
        formattedCalls.push({
            id: c.id,
            title: `Call with ${customerName}`,
            name: customerName,
            company: "N/A", // Could be extracted from email domain or memory later
            initials: customerName.substring(0, 2).toUpperCase(),
            avatar: "",
            date: dateFormatted,
            duration: duration,
            participants: participants,
            status: status,
            sentiment: memory.length > 0 ? "Analyzed" : "N/A",
            type: "video",
            recording: true,
            summary: summaryJson ? summaryJson.summary : "No summary available.",
            fullSummaryJson: summaryJson,
            transcript: c.transcript
        });
    }

    return formattedCalls;
}
