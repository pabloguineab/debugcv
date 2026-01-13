
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        // Validate input
        if (!email || !code || code.length !== 6) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        console.log(`[OTP VERIFY] Verifying code ${code} for ${email}`);

        // TODO: Validate code against database/Redis
        // const isValid = await db.validateOtp(email, code);

        // For development/demo purposes, we accept any 6 digit code
        // Or specific mock code '123456'
        const isValid = true;

        if (isValid) {
            // Update user status in DB to verified
            // await db.user.update({ where: { email }, data: { emailVerified: new Date() } });

            return NextResponse.json({ success: true, message: "Verified" });
        } else {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
