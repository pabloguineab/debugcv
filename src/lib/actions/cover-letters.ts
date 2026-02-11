"use server";

import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface SavedCoverLetter {
    id: string;
    user_email: string;
    resume_id?: string;
    name: string;
    target_job?: string;
    target_company?: string;
    content: string;
    job_description?: string;
    created_at: string;
    updated_at: string;
}

// Get user email from session
async function getUserEmail(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.email || null;
}

// Get all cover letters for the current user
export async function getCoverLetters(): Promise<SavedCoverLetter[]> {
    const userEmail = await getUserEmail();
    if (!userEmail) return [];

    const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("user_email", userEmail)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching cover letters:", error);
        return [];
    }

    return data || [];
}

// Get a single cover letter by ID
export async function getCoverLetter(id: string): Promise<SavedCoverLetter | null> {
    const userEmail = await getUserEmail();
    if (!userEmail) return null;

    const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("id", id)
        .eq("user_email", userEmail)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        console.error("Error fetching cover letter:", error);
        return null;
    }

    return data;
}

// Save or update a cover letter
export async function saveCoverLetter(
    id: string,
    name: string,
    content: string,
    resumeId?: string,
    targetJob?: string,
    targetCompany?: string,
    jobDescription?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
    const userEmail = await getUserEmail();
    if (!userEmail) {
        return { success: false, error: "Not authenticated" };
    }

    // Check if cover letter exists
    const { data: existing } = await supabase
        .from("cover_letters")
        .select("id")
        .eq("id", id)
        .eq("user_email", userEmail)
        .single();

    if (existing) {
        // Update existing
        const { error } = await supabase
            .from("cover_letters")
            .update({
                name,
                content,
                resume_id: resumeId,
                target_job: targetJob,
                target_company: targetCompany,
                job_description: jobDescription,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_email", userEmail);

        if (error) {
            console.error("Error updating cover letter:", error);
            return { success: false, error: error.message };
        }

        return { success: true, id };
    } else {
        // limit check
        const { checkUsageLimit } = await import("@/lib/limits");
        const canCreate = await checkUsageLimit("create_cover_letter");
        if (!canCreate) {
            return { success: false, error: "Free plan limit reached (3 cover letters). Upgrade to create more." };
        }

        // Insert new
        const { data, error } = await supabase
            .from("cover_letters")
            .insert({
                id,
                user_email: userEmail,
                name,
                content,
                resume_id: resumeId,
                target_job: targetJob,
                target_company: targetCompany,
                job_description: jobDescription,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error creating cover letter:", error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data.id };
    }
}

// Delete a cover letter
export async function deleteCoverLetter(id: string): Promise<{ success: boolean; error?: string }> {
    const userEmail = await getUserEmail();
    if (!userEmail) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("cover_letters")
        .delete()
        .eq("id", id)
        .eq("user_email", userEmail);

    if (error) {
        console.error("Error deleting cover letter:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
