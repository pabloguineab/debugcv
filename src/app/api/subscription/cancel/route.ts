
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subscriptionId } = await req.json();

        if (!subscriptionId) {
            return NextResponse.json({ error: "No subscription ID" }, { status: 400 });
        }

        // Validate subscription ownership (using email)
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(sub.customer as string);

        if ((customer as any).email !== session.user.email) {
            return NextResponse.json({ error: "Unauthorized access to subscription" }, { status: 403 });
        }

        // Cancel subscription
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        return NextResponse.json({ success: true, message: "Subscription cancelled successfully at period end" });

    } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
    }
}
