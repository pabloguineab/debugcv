import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, password } = await req.json();

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
        }

        // Update user identity in Supabase
        const { data, error } = await supabase
            .from('user_identities')
            .update(updateData)
            .eq('user_email', session.user.email)
            .select()
            .single();

        if (error) {
            console.error("[update-profile] Supabase error:", error);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({ success: true, name: name.trim() });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
