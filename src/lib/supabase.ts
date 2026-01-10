import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for user identity
export type UserIdentity = {
    user_email: string;
    provider: string;
    name: string | null;
    email: string | null;
    image: string | null;
    created_at?: string;
    updated_at?: string;
};

// Save user identity
export async function saveUserIdentity(identity: Omit<UserIdentity, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('user_identities')
        .upsert(
            {
                ...identity,
                updated_at: new Date().toISOString()
            },
            {
                onConflict: 'user_email'
            }
        )
        .select()
        .single();

    if (error) {
        console.error('[Supabase] Error saving user identity:', error);
        throw error;
    }

    console.log('[Supabase] Saved user identity for:', identity.user_email);
    return data;
}

// Get user identity
export async function getUserIdentity(userEmail: string): Promise<UserIdentity | null> {
    const { data, error } = await supabase
        .from('user_identities')
        .select('*')
        .eq('user_email', userEmail)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows found
            return null;
        }
        console.error('[Supabase] Error getting user identity:', error);
        throw error;
    }

    return data;
}
// Get all users (Admin)
export async function getAllUsers(): Promise<UserIdentity[]> {
    const { data, error } = await supabase
        .from('user_identities')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('[Supabase] Error getting all users:', error);
        return [];
    }

    return data || [];
}
