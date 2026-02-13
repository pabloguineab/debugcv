import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find Stripe customer
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json({
                paymentMethod: null,
                invoices: [],
            });
        }

        const customer = customers.data[0];

        // Get default payment method
        let paymentMethod = null;
        if (customer.invoice_settings?.default_payment_method) {
            const pm = await stripe.paymentMethods.retrieve(
                customer.invoice_settings.default_payment_method as string
            );
            if (pm.card) {
                paymentMethod = {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    expMonth: pm.card.exp_month,
                    expYear: pm.card.exp_year,
                };
            }
        } else {
            // Try to find any attached payment method
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customer.id,
                type: "card",
                limit: 1,
            });
            if (paymentMethods.data.length > 0) {
                const pm = paymentMethods.data[0];
                if (pm.card) {
                    paymentMethod = {
                        brand: pm.card.brand,
                        last4: pm.card.last4,
                        expMonth: pm.card.exp_month,
                        expYear: pm.card.exp_year,
                    };
                }
            }
        }

        // Get invoices
        const stripeInvoices = await stripe.invoices.list({
            customer: customer.id,
            limit: 10,
        });

        const invoices = stripeInvoices.data.map((inv) => ({
            id: inv.id,
            number: inv.number,
            date: inv.created,
            amount: inv.amount_paid,
            currency: inv.currency,
            status: inv.status,
            pdfUrl: inv.invoice_pdf,
            hostedUrl: inv.hosted_invoice_url,
        }));

        return NextResponse.json({
            paymentMethod,
            invoices,
        });
    } catch (error) {
        console.error("[BILLING_DETAILS]", error);
        return NextResponse.json(
            { error: "Failed to fetch billing details" },
            { status: 500 }
        );
    }
}
