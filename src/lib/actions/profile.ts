'use server'

import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- Types (matching DB structure but flexible for frontend) ---

export type ProfileData = {
    user_email: string;
    linkedin_user?: string;
    github_user?: string;
    portfolio_url?: string;
    bio?: string;
    location?: string;
    tech_stack?: string[];
    languages?: { language: string, level: string }[];
}

export type Experience = {
    id?: string;
    title: string;
    employment_type: string;
    company_name: string;
    country: string;
    location?: string;
    start_month: string;
    start_year: string;
    end_month: string;
    end_year: string;
    is_current: boolean;
    description: string;
    skills: string[];
}

export type Education = {
    id?: string;
    school: string;
    school_url: string;
    degree: string;
    field_of_study: string;
    grade: string;
    activities: string;
    description: string;
    start_year: string;
    end_year: string;
    is_current: boolean;
}

export type Project = {
    id?: string;
    name: string;
    project_url: string;
    description: string;
    technologies: string[];
    start_month?: string;
    start_year?: string;
    end_month?: string;
    end_year?: string;
    is_ongoing: boolean;
}

export type Certification = {
    id?: string;
    name: string;
    issuing_org: string;
    credential_id: string;
    credential_url: string;
    issue_month: string;
    issue_year: string;
    expiration_month: string;
    expiration_year: string;
    no_expiration: boolean;
    skills: string[];
}

// --- Helpers ---

async function getUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }
    return session.user;
}

// --- Actions ---

export async function fetchFullProfile() {
    const user = await getUser();
    const email = user.email!;

    try {
        const [
            { data: profile },
            { data: experiences },
            { data: educations },
            { data: projects },
            { data: certifications }
        ] = await Promise.all([
            supabase.from('profiles').select('*').eq('user_email', email).single(),
            supabase.from('experiences').select('*').eq('user_email', email).order('start_year', { ascending: false }),
            supabase.from('educations').select('*').eq('user_email', email).order('start_year', { ascending: false }),
            supabase.from('projects').select('*').eq('user_email', email).order('created_at', { ascending: false }),
            supabase.from('certifications').select('*').eq('user_email', email).order('created_at', { ascending: false })
        ]);

        return {
            profile: profile || null,
            experiences: experiences || [],
            educations: educations || [],
            projects: projects || [],
            certifications: certifications || []
        };
    } catch (error) {
        console.error("Error fetching full profile:", error);
        return null;
    }
}

// --- PROFILE BASIC INFO ---
export async function updateProfile(data: Partial<ProfileData>) {
    const user = await getUser();
    const email = user.email!;

    const { error } = await supabase
        .from('profiles')
        .upsert({ ...data, user_email: email })
        .eq('user_email', email);

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return { success: true };
}

// --- EXPERIENCE ---
export async function saveExperience(data: Experience) {
    const user = await getUser();
    const email = user.email!;

    // If ID is numeric (from Date.now()), remove it to let DB generate UUID
    // Or if undefined, it's new
    let id: string | undefined = data.id;
    if (id && !id.includes('-') && !isNaN(Number(id))) {
        id = undefined;
    }

    const payload = {
        user_email: email,
        title: data.title,
        employment_type: data.employment_type,
        company_name: data.company_name,
        country: data.country,
        location: data.location,
        start_month: data.start_month,
        start_year: data.start_year,
        end_month: data.end_month,
        end_year: data.end_year,
        is_current: data.is_current,
        description: data.description,
        skills: data.skills,
        ...(id ? { id } : {})
    };

    // Use upsert
    const { data: result, error } = await supabase
        .from('experiences')
        .upsert(payload)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return result;
}

export async function deleteExperience(id: string) {
    const user = await getUser();
    const email = user.email!;

    // If it's a temp ID (numeric), we can't delete from DB, but it shouldn't be there yet.
    // Assuming UI handles temp IDs removal locally if not saved.

    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('user_email', email);

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return { success: true };
}

// --- EDUCATION ---
export async function saveEducation(data: Education) {
    const user = await getUser();
    const email = user.email!;

    let id: string | undefined = data.id;
    if (id && !id.includes('-') && !isNaN(Number(id))) {
        id = undefined;
    }

    const payload = {
        user_email: email,
        school: data.school,
        school_url: data.school_url,
        degree: data.degree,
        field_of_study: data.field_of_study,
        grade: data.grade,
        activities: data.activities,
        description: data.description,
        start_year: data.start_year,
        end_year: data.end_year,
        is_current: data.is_current,
        ...(id ? { id } : {})
    };

    const { data: result, error } = await supabase
        .from('educations')
        .upsert(payload)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return result;
}

export async function deleteEducation(id: string) {
    const user = await getUser();
    const email = user.email!;

    const { error } = await supabase
        .from('educations')
        .delete()
        .eq('id', id)
        .eq('user_email', email);

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return { success: true };
}

// --- PROJECTS ---
export async function saveProject(data: Project) {
    const user = await getUser();
    const email = user.email!;

    let id: string | undefined = data.id;
    if (id && !id.includes('-') && !isNaN(Number(id))) {
        id = undefined;
    }

    const payload = {
        user_email: email,
        name: data.name,
        project_url: data.project_url,
        description: data.description,
        technologies: data.technologies,
        start_month: data.start_month,
        start_year: data.start_year,
        end_month: data.end_month,
        end_year: data.end_year,
        is_ongoing: data.is_ongoing,
        ...(id ? { id } : {})
    };

    const { data: result, error } = await supabase
        .from('projects')
        .upsert(payload)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return result;
}

export async function deleteProject(id: string) {
    const user = await getUser();
    const email = user.email!;

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_email', email);

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return { success: true };
}

// --- CERTIFICATIONS ---
export async function saveCertification(data: Certification) {
    const user = await getUser();
    const email = user.email!;

    let id: string | undefined = data.id;
    if (id && !id.includes('-') && !isNaN(Number(id))) {
        id = undefined;
    }

    const payload = {
        user_email: email,
        name: data.name,
        issuing_org: data.issuing_org,
        credential_id: data.credential_id,
        credential_url: data.credential_url,
        issue_month: data.issue_month,
        issue_year: data.issue_year,
        expiration_month: data.expiration_month,
        expiration_year: data.expiration_year,
        no_expiration: data.no_expiration,
        skills: data.skills,
        ...(id ? { id } : {})
    };

    const { data: result, error } = await supabase
        .from('certifications')
        .upsert(payload)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return result;
}

export async function deleteCertification(id: string) {
    const user = await getUser();
    const email = user.email!;

    const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id)
        .eq('user_email', email);

    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return { success: true };
}
