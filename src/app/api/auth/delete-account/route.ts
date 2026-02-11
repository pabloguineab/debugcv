
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Initialize Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { otp } = await req.json();

        if (!otp) {
            return NextResponse.json({ error: "OTP is required" }, { status: 400 });
        }

        const email = session.user.email;

        // Verify OTP
        const { data: otpRecords, error: otpError } = await supabase
            .from("otp_codes")
            .select("*")
            .eq("email", email)
            .eq("code", otp)
            .gt("expires_at", new Date().toISOString())
            .order("created_at", { ascending: false })
            .limit(1);

        if (otpError || !otpRecords || otpRecords.length === 0) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // OTP Valid! Proceed with Deletion.

        // 1. Cancel Stripe Subscription / Delete Customer
        try {
            const customers = await stripe.customers.list({ email, limit: 1 });
            if (customers.data.length > 0) {
                const customerId = customers.data[0].id;
                // Delete customer completely from Stripe (cancels subs immediately)
                await stripe.customers.del(customerId);
                console.log(`[Delete Account] Stripe customer ${customerId} deleted.`);
            }
        } catch (stripeError) {
            console.error("[Delete Account] Stripe error (non-fatal):", stripeError);
            // Continue even if Stripe fails, we want to delete app data at least.
        }

        // 2. Delete Application Data
        await supabase.from("applications").delete().eq("user_email", email);
        await supabase.from("scans").delete().eq("user_email", email);
        // Add other tables if any (e.g. cv_reviews)

        // 3. Delete OTP codes
        await supabase.from("otp_codes").delete().eq("email", email);

        // 4. Delete User Identity
        // Depending on auth strategy, we might delete from 'user_identities' table or Auth users.
        // If using Supabase Auth (auth.users), we need admin API.
        // If using custom 'user_identities' table:
        const { error: deleteUserError } = await supabase.from("user_identities").delete().eq("email", email);

        if (deleteUserError) {
            console.error("[Delete Account] Failed to delete user identity:", deleteUserError);
            return NextResponse.json({ error: "Partially failed to delete user data" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Account permanently deleted" });

    } catch (error: any) {
        console.error("[Delete Account] Critical Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
