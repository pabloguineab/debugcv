import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

// ONE-TIME cleanup endpoint - void all open $0 invoices and cancel incomplete subs
// DELETE this file after running it once
export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find customer
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ message: "No customer found" });
        }

        const customerId = customers.data[0].id;

        // 1. Cancel all incomplete subscriptions
        const incompleteSubs = await stripe.subscriptions.list({
            customer: customerId,
            status: "incomplete",
        });

        let cancelledSubs = 0;
        for (const sub of incompleteSubs.data) {
            await stripe.subscriptions.cancel(sub.id);
            cancelledSubs++;
        }

        // 2. Void all open invoices
        const openInvoices = await stripe.invoices.list({
            customer: customerId,
            status: "open",
            limit: 100,
        });

        let voidedInvoices = 0;
        for (const inv of openInvoices.data) {
            await stripe.invoices.voidInvoice(inv.id);
            voidedInvoices++;
        }

        // 3. Delete all draft invoices
        const draftInvoices = await stripe.invoices.list({
            customer: customerId,
            status: "draft",
            limit: 100,
        });

        let deletedInvoices = 0;
        for (const inv of draftInvoices.data) {
            try {
                await stripe.invoices.del(inv.id);
                deletedInvoices++;
            } catch (e) {
                // Some drafts can't be deleted, skip
            }
        }

        return NextResponse.json({
            message: "Cleanup complete",
            cancelledSubs,
            voidedInvoices,
            deletedInvoices,
        });
    } catch (error: any) {
        console.error("[CLEANUP]", error);
        return NextResponse.json({ error: error?.message }, { status: 500 });
    }
}
