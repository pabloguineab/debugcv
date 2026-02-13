import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { amount = 199, currency = "eur" } = body;
        let metadata: any = {};

        // If a specific Playbook Price ID is configured in env, use it to determine amount/currency
        const playbookPriceId = process.env.STRIPE_PRICE_ID_PLAYBOOK;

        if (playbookPriceId) {
            try {
                let price;

                // If user provided a Product ID (starts with prod_), find its default price
                if (playbookPriceId.startsWith('prod_')) {
                    const prices = await stripe.prices.list({
                        product: playbookPriceId,
                        active: true,
                        limit: 1,
                    });
                    if (prices.data.length > 0) {
                        price = prices.data[0];
                    }
                } else {
                    // Assume it's a Price ID (starts with price_ or similar)
                    price = await stripe.prices.retrieve(playbookPriceId);
                }

                if (price) {
                    amount = price.unit_amount || amount;
                    currency = price.currency || currency;
                    metadata.priceId = price.id;
                    metadata.productId = typeof price.product === 'string' ? price.product : price.product.id;
                }
            } catch (e) {
                console.warn("Failed to retrieve configured playbook price:", e);
                // Fallback to client-provided amount
            }
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: metadata,
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            amount: amount, // Return actual amount used
            currency: currency,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
