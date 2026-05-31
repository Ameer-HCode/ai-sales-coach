
import { db } from './db/index';
import { calls, customers } from './db/schema';
import { desc, eq } from 'drizzle-orm';

async function main() {
    console.log("🔍 Checking Database for recent calls...");
    try {
        const recentCalls = await db.select({
            callId: calls.id,
            status: calls.status,
            customer: customers.email,
            startedAt: calls.startedAt
        })
            .from(calls)
            .leftJoin(customers, desc(calls.startedAt)) // This join syntax might be wrong for leftJoin but lets try simple first
            .limit(5);

        // Explicit join query
        const result = await db.select({
            id: calls.id,
            status: calls.status,
            customerEmail: customers.email,
            startedAt: calls.startedAt
        })
            .from(calls)
            .leftJoin(customers, eq(calls.customerId, customers.id))
            .orderBy(desc(calls.startedAt))
            .limit(5);

        console.log("-----------------------------------------");
        if (result.length === 0) {
            console.log("❌ No calls found in database.");
        } else {
            result.forEach(row => {
                console.log(`✅ [${(row.status || 'unknown').toUpperCase()}] ID: ${row.id} | Customer: ${row.customerEmail || 'N/A'} | Time: ${row.startedAt}`);
            })
        }
        console.log("-----------------------------------------");
    } catch (e) {
        console.error("Error checking DB:", e);
    }
    process.exit(0);
}

main();
