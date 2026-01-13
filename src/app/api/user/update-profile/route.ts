import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveUserIdentity } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 });
        }

        // Update user identity in Supabase
        await saveUserIdentity({
            user_email: session.user.email,
            provider: 'otp', // or retrieve from session if available
            name: name.trim(),
            email: session.user.email,
            image: session.user.image || null,
        });

        return NextResponse.json({ success: true, name: name.trim() });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
