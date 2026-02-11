
"use server";

import { checkUsageLimit, incrementUsage } from "@/lib/limits";

export type UsageAction = "create_resume" | "create_cover_letter" | "download_resume" | "download_cover_letter" | "ats_scan";

export async function checkLimitAction(action: UsageAction): Promise<{ allowed: boolean; error?: string }> {
    try {
        const allowed = await checkUsageLimit(action);
        if (!allowed) {
            return { allowed: false, error: "Usage limit reached for your plan." };
        }
        return { allowed: true };
    } catch (error) {
        console.error("Error checking usage limit:", error);
        return { allowed: false, error: "Failed to check usage limits." };
    }
}

export async function trackUsageAction(action: "download_resume" | "download_cover_letter" | "ats_scan"): Promise<{ success: boolean; error?: string }> {
    try {
        // Check first
        const allowed = await checkUsageLimit(action);
        if (!allowed) {
            return { success: false, error: "Monthly limit reached for this feature. Please upgrade to Pro." };
        }

        // Track
        await incrementUsage(action);
        return { success: true };
    } catch (error) {
        console.error("Error tracking usage:", error);
        return { success: false, error: "Failed to track usage." };
    }
}
