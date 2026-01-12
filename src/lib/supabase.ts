import { createClient } from '@supabase/supabase-js';
import type { Application, ApplicationStatus, ApplicationPriority, WorkMode } from '@/types/application';

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

// ============================================
// APPLICATION MANAGEMENT
// ============================================

// DB type (snake_case for Supabase)
interface ApplicationDB {
    id: string;
    user_email: string;
    title: string;
    company: string;
    logo?: string;
    job_url?: string;
    location?: string;
    work_mode?: string;
    expected_salary_min?: number;
    expected_salary_max?: number;
    priority: string;
    status: string;
    cover_letter?: string;
    notes?: string;
    job_description?: string;
    match_analysis?: string; // JSON string
    contacts?: string; // JSON string
    history?: string; // JSON string
    applied_date?: string;
    interview_date?: string;
    offer_date?: string;
    rejected_date?: string;
    created_at?: string;
    updated_at?: string;
}

// Convert DB row to Application type
function dbToApplication(row: ApplicationDB): Application {
    return {
        id: row.id,
        userEmail: row.user_email,
        title: row.title,
        company: row.company,
        logo: row.logo,
        jobUrl: row.job_url,
        location: row.location,
        workMode: row.work_mode as WorkMode | undefined,
        expectedSalary: row.expected_salary_min && row.expected_salary_max
            ? [row.expected_salary_min, row.expected_salary_max]
            : undefined,
        priority: row.priority as ApplicationPriority,
        status: row.status as ApplicationStatus,
        coverLetter: row.cover_letter,
        notes: row.notes,
        jobDescription: row.job_description,
        matchAnalysis: row.match_analysis ? JSON.parse(row.match_analysis) : undefined,
        contacts: row.contacts ? JSON.parse(row.contacts) : undefined,
        history: row.history ? JSON.parse(row.history) : undefined,
        appliedDate: row.applied_date,
        interviewDate: row.interview_date,
        offerDate: row.offer_date,
        rejectedDate: row.rejected_date,
        date: row.created_at || new Date().toISOString(),
    };
}

// Convert Application to DB row
function applicationToDB(app: Partial<Application> & { userEmail: string }): Partial<ApplicationDB> {
    return {
        user_email: app.userEmail,
        title: app.title,
        company: app.company,
        logo: app.logo,
        job_url: app.jobUrl,
        location: app.location,
        work_mode: app.workMode,
        expected_salary_min: app.expectedSalary?.[0],
        expected_salary_max: app.expectedSalary?.[1],
        priority: app.priority,
        status: app.status,
        cover_letter: app.coverLetter,
        notes: app.notes,
        job_description: app.jobDescription,
        match_analysis: app.matchAnalysis ? JSON.stringify(app.matchAnalysis) : undefined,
        contacts: app.contacts ? JSON.stringify(app.contacts) : undefined,
        history: app.history ? JSON.stringify(app.history) : undefined,
        applied_date: app.appliedDate,
        interview_date: app.interviewDate,
        offer_date: app.offerDate,
        rejected_date: app.rejectedDate,
    };
}

// Get all applications for a user
export async function getApplications(userEmail: string): Promise<Application[]> {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Supabase] Error getting applications:', error);
        return [];
    }

    return (data || []).map(dbToApplication);
}

// Get a single application
export async function getApplication(id: string, userEmail: string): Promise<Application | null> {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .eq('user_email', userEmail)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('[Supabase] Error getting application:', error);
        return null;
    }

    return dbToApplication(data);
}

// Add a new application
export async function addApplication(app: Omit<Application, 'id' | 'date'>): Promise<Application | null> {
    const dbApp = applicationToDB({ ...app, userEmail: app.userEmail });

    const { data, error } = await supabase
        .from('applications')
        .insert({
            ...dbApp,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('[Supabase] Error adding application:', error);
        return null;
    }

    console.log('[Supabase] Added application:', data.title, 'at', data.company);
    return dbToApplication(data);
}

// Update an application
export async function updateApplication(id: string, userEmail: string, updates: Partial<Application>): Promise<Application | null> {
    const dbUpdates = applicationToDB({ ...updates, userEmail });

    const { data, error } = await supabase
        .from('applications')
        .update({
            ...dbUpdates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_email', userEmail)
        .select()
        .single();

    if (error) {
        console.error('[Supabase] Error updating application:', error);
        return null;
    }

    console.log('[Supabase] Updated application:', id);
    return dbToApplication(data);
}

// Delete an application
export async function deleteApplication(id: string, userEmail: string): Promise<boolean> {
    const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_email', userEmail);

    if (error) {
        console.error('[Supabase] Error deleting application:', error);
        return false;
    }

    console.log('[Supabase] Deleted application:', id);
    return true;
}
