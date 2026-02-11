import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find Stripe customer by email
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ status: "none", isPro: false });
        }

        const customer = customers.data[0];

        // Find active subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active",
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ status: "none", isPro: false });
        }

        const sub = subscriptions.data[0] as any;
        const price = sub.items.data[0].price;
        const productName = price.nickname || "Pro Plan";

        // Check if it's already set to cancel
        const isCanceled = sub.cancel_at_period_end;

        return NextResponse.json({
            status: "active",
            isPro: true,
            plan: productName,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency,
            interval: price.recurring?.interval,
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: isCanceled,
            subscriptionId: sub.id,
        });

    } catch (error: any) {
        console.error("Error fetching subscription:", error);
        return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
    }
}
