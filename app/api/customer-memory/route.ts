import { db } from '@/lib/db';
import { customerMemory, customers } from '@/backend/db/schema';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        const customerId = searchParams.get('customerId');

        if (!email && !customerId) {
            return NextResponse.json({ error: 'Email or CustomerID required' }, { status: 400 });
        }

        let targetCustomerId = customerId;

        // Lookup by Email if needed
        if (email && !targetCustomerId) {
            const cust = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
            if (cust.length > 0) targetCustomerId = cust[0].id;
            else return NextResponse.json({ memory: null }); // New customer
        }

        // Fetch Latest Memory
        const memories = await db.select()
            .from(customerMemory)
            // @ts-ignore
            .where(eq(customerMemory.customerId, targetCustomerId))
            .orderBy(desc(customerMemory.createdAt))
            .limit(1);

        if (memories.length === 0) {
            return NextResponse.json({ memory: null });
        }

        return NextResponse.json({ memory: memories[0].summaryJson });

    } catch (error) {
        console.error("Get Memory Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
