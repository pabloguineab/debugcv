import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { plan } = body;

        if (!plan) {
            return new NextResponse("Plan is required", { status: 400 });
        }

        // Map plan names to Price IDs
        let priceId: string | undefined;

        if (plan === "Break into Tech") {
            priceId = process.env.STRIPE_PRICE_ID_PRO;
        } else if (plan === "Climb the Ladder") {
            priceId = process.env.STRIPE_PRICE_ID_PREMIUM;
        }

        if (!priceId) {
            console.error(`Price ID not found for plan: ${plan}`);
            return NextResponse.json({ error: "Price ID configuration missing" }, { status: 500 });
        }

        // Find or create Stripe customer
        let customerId: string;
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: session.user.email,
                name: session.user.name || undefined,
            });
            customerId = customer.id;
        }

        // Cancel any existing incomplete subscriptions to avoid orphaned invoices
        const existingSubs = await stripe.subscriptions.list({
            customer: customerId,
            status: "incomplete",
        });
        for (const sub of existingSubs.data) {
            await stripe.subscriptions.cancel(sub.id);
        }

        // Create subscription with incomplete payment
        // This returns a clientSecret we can use with Stripe Elements
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: "default_incomplete",
            payment_settings: {
                save_default_payment_method: "on_subscription",
            },
            expand: ["latest_invoice.payment_intent"],
            metadata: {
                userId: session.user.email,
                plan: plan,
            },
        });

        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent;

        if (!paymentIntent?.client_secret) {
            return NextResponse.json({ error: "Could not create payment intent" }, { status: 500 });
        }

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error: any) {
        console.error("[SUBSCRIPTION_CREATE]", error);
        return NextResponse.json(
            { error: error?.message || "Internal Error" },
            { status: 500 }
        );
    }
}
