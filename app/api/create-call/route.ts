import { db } from '@/backend/db/index';
import { calls, customers } from '@/backend/db/schema';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { customerEmail, customerName } = await req.json();

        if (!customerEmail) {
            return NextResponse.json({ error: 'Customer email required' }, { status: 400 });
        }

        // 1. Check or Create Customer
        let customerId;
        const existingCustomer = await db.select().from(customers).where(eq(customers.email, customerEmail)).limit(1);

        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
        } else {
            const newCustomer = await db.insert(customers).values({
                email: customerEmail,
                name: customerName,
            }).returning({ id: customers.id });
            customerId = newCustomer[0].id;
        }

        // 2. Create Call
        const newCall = await db.insert(calls).values({
            businessOwnerId: userId,
            customerId: customerId,
            customerEmail: customerEmail,
            status: 'ongoing',
        }).returning({ id: calls.id });

        return NextResponse.json({
            callId: newCall[0].id,
            customerId: customerId
        });

    } catch (error) {
        console.error("Create Call Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
