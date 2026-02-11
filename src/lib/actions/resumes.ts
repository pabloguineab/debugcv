"use server";

import { supabase } from "@/lib/supabase";
import { ResumeData } from "@/types/resume";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"

export interface SavedResume {
    id: string;
    user_email: string;
    name: string;
    target_job?: string;
    target_company?: string;
    job_description?: string;
    data: ResumeData;
    created_at: string;
    updated_at: string;
}

// Get user email from session
async function getUserEmail(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.email || null;
}

// Get all resumes for the current user
export async function getResumes(): Promise<SavedResume[]> {
    const userEmail = await getUserEmail();
    if (!userEmail) return [];

    const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_email", userEmail)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching resumes:", error);
        return [];
    }

    return data || [];
}

// Get a single resume by ID
export async function getResume(id: string): Promise<SavedResume | null> {
    const userEmail = await getUserEmail();
    if (!userEmail) return null;

    const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id)
        .eq("user_email", userEmail)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null; // No rows found
        console.error("Error fetching resume:", error);
        return null;
    }

    return data;
}

// Save or update a resume
export async function saveResume(
    id: string,
    name: string,
    resumeData: ResumeData,
    targetJob?: string,
    targetCompany?: string,
    jobDescription?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
    const userEmail = await getUserEmail();
    if (!userEmail) {
        return { success: false, error: "Not authenticated" };
    }

    // Check if resume exists
    const { data: existing } = await supabase
        .from("resumes")
        .select("id")
        .eq("id", id)
        .eq("user_email", userEmail)
        .single();

    if (existing) {
        // Update existing resume
        const { error } = await supabase
            .from("resumes")
            .update({
                name,
                target_job: targetJob,
                target_company: targetCompany,
                job_description: jobDescription,
                data: resumeData,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_email", userEmail);

        if (error) {
            console.error("Error updating resume:", error);
            return { success: false, error: error.message };
        }

        return { success: true, id };
    } else {
        // limit check
        // Check resume limit for free plan
        const { checkUsageLimit } = await import("@/lib/limits");
        const canCreate = await checkUsageLimit("create_resume");
        if (!canCreate) {
            return { success: false, error: "Free plan limit reached (3 resumes). Upgrade to create more." };
        }

        // Insert new resume
        const { data, error } = await supabase
            .from("resumes")
            .insert({
                id,
                user_email: userEmail,
                name,
                target_job: targetJob,
                target_company: targetCompany,
                job_description: jobDescription,
                data: resumeData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error creating resume:", error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data.id };
    }
}

// Delete a resume
export async function deleteResumeAction(id: string): Promise<{ success: boolean; error?: string }> {
    const userEmail = await getUserEmail();
    if (!userEmail) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", id)
        .eq("user_email", userEmail);

    if (error) {
        console.error("Error deleting resume:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
