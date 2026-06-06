'use server';

import { db } from '@/lib/db';
import { calls, customers, customerMemory, callParticipants } from '@/backend/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export async function getCallsData(timestamp?: number) {
    const allCalls = await db.select().from(calls).orderBy(desc(calls.startedAt)).limit(15);
    
    const callIds = allCalls.map(c => c.id);
    const customerIds = allCalls.map(c => c.customerId).filter(Boolean) as string[];

    // Bulk fetch to solve N+1 queries latency
    const [fetchedCustomers, fetchedParticipants, fetchedMemories] = await Promise.all([
        customerIds.length > 0 ? db.select().from(customers).where(inArray(customers.id, customerIds)) : Promise.resolve([]),
        callIds.length > 0 ? db.select().from(callParticipants).where(inArray(callParticipants.callId, callIds)) : Promise.resolve([]),
        callIds.length > 0 ? db.select().from(customerMemory).where(inArray(customerMemory.callId, callIds)) : Promise.resolve([])
    ]);

    const customerMap = new Map(fetchedCustomers.map(c => [c.id, c]));
    const memoryMap = new Map(fetchedMemories.map(m => [m.callId, m]));
    const participantsMap = fetchedParticipants.reduce((acc, p) => {
        if (!acc[p.callId]) acc[p.callId] = [];
        acc[p.callId].push(p);
        return acc;
    }, {} as Record<string, any[]>);

    const formattedCalls = allCalls.map(c => {
        let customerName = "Unknown Customer";
        if (c.customerId) {
            const cust = customerMap.get(c.customerId);
            if (cust) customerName = cust.name || cust.email;
        } else if (c.customerEmail) {
            customerName = c.customerEmail;
        }

        const rawParts = participantsMap[c.id] || [];
        const participants = rawParts.length > 0 
            ? rawParts.map(p => ({ name: p.name, img: "", fallback: p.name.substring(0, 2).toUpperCase() }))
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
        let status = c.status === 'ended' ? 'Completed' : (c.status === 'ongoing' ? 'Negotiation' : 'Missed');
        
        const memory = memoryMap.get(c.id);
        let summaryJson = memory ? (memory.summaryJson as any) : null;
        if (typeof summaryJson === 'string') {
            try { summaryJson = JSON.parse(summaryJson); } catch (e) {}
        }
        
        return {
            id: c.id,
            title: `Call with ${customerName}`,
            name: customerName,
            company: "N/A",
            initials: customerName.substring(0, 2).toUpperCase(),
            avatar: "",
            date: dateFormatted,
            duration: duration,
            participants: participants,
            status: status,
            sentiment: memory ? "Analyzed" : "N/A",
            type: "video",
            recording: true,
            summary: summaryJson ? summaryJson.summary : "No summary available.",
            fullSummaryJson: summaryJson
        };
    });

    return formattedCalls;
}
