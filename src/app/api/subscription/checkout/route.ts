
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

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // Map plan names to Price IDs from environment variables
        let priceId: string | undefined;

        if (plan === "Break into Tech") {
            priceId = process.env.STRIPE_PRICE_ID_PRO;
        } else if (plan === "Climb the Ladder") {
            priceId = process.env.STRIPE_PRICE_ID_PREMIUM;
        }

        if (!priceId) {
            console.error(`Price ID not found for plan: ${plan}`);
            return new NextResponse("Price ID configuration missing", { status: 500 });
        }

        // Check if user already has a Stripe customer ID to prevent duplicates
        let customerId: string | undefined;
        try {
            const customers = await stripe.customers.list({
                email: session.user.email,
                limit: 1,
            });
            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
            }
        } catch (err) {
            console.error("Error finding customer:", err);
            // Continue to create new one if search fails
        }

        const sessionConfig: any = {
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${dashboardUrl}/dashboard/billing?success=true`,
            cancel_url: `${dashboardUrl}/dashboard/billing?canceled=true`,
            metadata: {
                userId: session.user.email,
                plan: plan
            },
            subscription_data: {
                metadata: {
                    userId: session.user.email,
                    plan: plan
                }
            }
        };

        if (customerId) {
            sessionConfig.customer = customerId;
        } else {
            sessionConfig.customer_email = session.user.email;
        }

        const sessionStripe = await stripe.checkout.sessions.create(sessionConfig);

        if (!sessionStripe.url) {
            return new NextResponse("Error creating stripe session", { status: 500 });
        }

        return NextResponse.json({ url: sessionStripe.url });

    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
