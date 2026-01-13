
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getUserIdentity } from '@/lib/supabase';

// Initialize Resend with API Key from env
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function POST(req: Request) {
    try {
        const { email, isSignup } = await req.json();

        // If this is a signup request, check if user already exists
        if (isSignup) {
            try {
                const existingUser = await getUserIdentity(email);
                if (existingUser) {
                    return NextResponse.json(
                        { error: "USER_EXISTS", message: "This email is already registered" },
                        { status: 409 }
                    );
                }
            } catch (error) {
                // If error is not "not found", log it but continue
                console.error("[send-otp] Error checking existing user:", error);
            }
        }

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // In a real app, you would save this code to your database with an expiration time
        console.log(`[OTP DEBUG] Generated code for ${email}: ${code}`);

        // Email HTML Template matching the user's request
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; text-align: center; }
                .logo { margin-bottom: 24px; }
                .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 24px 0; color: #1e293b; }
                .btn { background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
                .footer { margin-top: 40px; font-size: 12px; color: #64748b; }
                .illustration { margin-bottom: 24px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                     <h2 style="color: #2563EB; margin: 0;">DebugCV</h2>
                </div>
                
                <div class="illustration">
                    <!-- Placeholder for the purple wave illustration in the example, replaced with a generic or CSS shape if needed -->
                    <div style="width: 60px; height: 40px; background-color: #2563EB; border-radius: 4px 4px 20px 4px; margin: 0 auto; opacity: 0.8;"></div>
                </div>

                <p style="font-size: 16px;">Hi there,</p>
                
                <p style="font-size: 16px;">Here is your verification code:</p>
                
                <div class="code">${code.split('').join(' ')}</div>
                
                <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">
                    This code will only be valid for the next 5 minutes. If the code does not work, you can use this login verification link:
                </p>
                
                <a href="https://debugcv.com/auth/verify?email=${email}&code=${code}" class="btn">Verify email</a>
                
                <div class="footer">
                    <p>Thanks!<br>Team DebugCV</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p>This email was sent to you from DebugCV.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'DebugCV <info@debugcv.com>',
                to: email,
                subject: `${code} is your verification code`,
                html: htmlContent,
            });
            return NextResponse.json({ success: true, message: "Email sent" });
        } else {
            console.log("No RESEND_API_KEY found. Mocking email send.");
            // Return success even if mocked, so UI shows the next step
            return NextResponse.json({ success: true, message: "Mock email sent (check console)" });
        }

    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
