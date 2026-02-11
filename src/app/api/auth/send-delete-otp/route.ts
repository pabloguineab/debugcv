
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client to bypass RLS for writing OTP
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        // Generate 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete existing codes for this email to avoid clutter
        await supabase.from("otp_codes").delete().eq("email", email);

        // Store OTP in DB
        const { error: dbError } = await supabase.from("otp_codes").insert({
            email,
            code,
            expires_at: expiresAt.toISOString(),
        });

        if (dbError) {
            console.error("DB Error storing OTP:", dbError);
            return NextResponse.json({ error: "Database error. Check logs." }, { status: 500 });
        }

        // Send Email via Resend
        if (!RESEND_API_KEY) {
            console.warn("Missing RESEND_API_KEY. OTP generated:", code);
            // In dev, we might log it. In prod, this is critical failure.
            return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
        }

        const resend = new Resend(RESEND_API_KEY);

        const { error: emailError } = await resend.emails.send({
            from: "DebugCV Security <security@debugcv.com>",
            to: email,
            subject: `Action Required: Confirm Account Deletion Code (${code})`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
                        .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626; margin: 20px 0; background: #fef2f2; padding: 10px; display: inline-block; border-radius: 8px; }
                        .warning { color: #dc2626; font-weight: bold; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Confirm Account Deletion</h2>
                        <p>You requested to permanently delete your DebugCV account. This action cannot be undone.</p>
                        <p class="warning">use the following code to confirm:</p>
                        <div class="code">${code}</div>
                        <p>This code expires in 10 minutes.</p>
                        <p>If you did not request this, please ignore this email and secure your account.</p>
                    </div>
                </body>
                </html>
            `,
        });

        if (emailError) {
            console.error("Resend Error:", emailError);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "OTP sent to your email" });

    } catch (error: any) {
        console.error("Error generating delete OTP:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
