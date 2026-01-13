import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { name, password, email: bodyEmail } = await req.json();

        // Try to get session, but also accept email from body for first-time setup
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || bodyEmail;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized - No email found" }, { status: 401 });
        }

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 });
        }

        // Prepare update data
        const updateData: Record<string, string> = {
            name: name.trim(),
            updated_at: new Date().toISOString(),
        };

        // Hash password if provided
        if (password && typeof password === 'string' && password.length >= 6) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            updateData.password_hash = passwordHash;
            console.log('[update-profile] Hashing password for:', userEmail);
        }

        console.log('[update-profile] Updating user:', userEmail, 'with fields:', Object.keys(updateData));

        // Update user identity in Supabase
        const { data, error } = await supabase
            .from('user_identities')
            .update(updateData)
            .eq('user_email', userEmail)
            .select()
            .single();

        if (error) {
            console.error("[update-profile] Supabase error:", error);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        console.log('[update-profile] Successfully updated user:', userEmail);
        return NextResponse.json({ success: true, name: name.trim() });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
