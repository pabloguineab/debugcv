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

        // Prepare upsert data
        const upsertData: Record<string, string> = {
            user_email: userEmail,
            name: name.trim(),
            email: userEmail,
            updated_at: new Date().toISOString(),
        };

        // Hash password if provided
        if (password && typeof password === 'string' && password.length >= 6) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            upsertData.password_hash = passwordHash;
            console.log('[update-profile] Hashing password for:', userEmail);
        }

        console.log('[update-profile] Upserting user:', userEmail, 'with fields:', Object.keys(upsertData));

        // Upsert user identity in Supabase (insert if not exists, update if exists)
        const { data, error } = await supabase
            .from('user_identities')
            .upsert(upsertData, { onConflict: 'user_email' })
            .select()
            .single();

        if (error) {
            console.error("[update-profile] Supabase error:", error);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        console.log('[update-profile] Successfully upserted user:', userEmail);
        return NextResponse.json({ success: true, name: name.trim() });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
