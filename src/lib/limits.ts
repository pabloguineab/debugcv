
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client for secure usage tracking
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const PLAN_LIMITS = {
    FREE: {
        RESUMES: 3,
        COVER_LETTERS: 3,
        RESUME_DOWNLOADS: 1, // Per month? User didn't specify, assuming monthly
        COVER_LETTER_DOWNLOADS: 1,
        ATS_SCANS: 3,
        JOB_SEARCH: Infinity, // "Free" job search implies unlimited access to basic search?
    },
    PRO: {
        RESUMES: Infinity,
        COVER_LETTERS: Infinity,
        RESUME_DOWNLOADS: Infinity,
        COVER_LETTER_DOWNLOADS: Infinity,
        ATS_SCANS: Infinity,
        JOB_SEARCH: Infinity,
    }
};

export async function getUserSubscriptionStatus(email: string) {
    if (!email) return { isPro: false };

    // Check Stripe directly (could be cached in DB for performance)
    try {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length === 0) return { isPro: false };

        const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: "active",
            limit: 1,
        });

        return { isPro: subscriptions.data.length > 0 };
    } catch (error) {
        console.error("Error checking subscription:", error);
        return { isPro: false }; // Default to Free on error
    }
}

export async function checkUsageLimit(action: "create_resume" | "create_cover_letter" | "download_resume" | "download_cover_letter" | "ats_scan") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const email = session.user.email;
    const { isPro } = await getUserSubscriptionStatus(email);

    if (isPro) return true; // Pro users have unlimited access

    // Check usage in DB
    const { data: usage, error } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_email", email)
        .single();

    if (error && error.code !== "PGRST116") { // Error other than not found
        console.error("Error checking usage:", error);
        return false; // Fail safe
    }

    // Initialize usage if not exists
    const currentUsage = usage || {
        resume_downloads: 0,
        cover_letter_downloads: 0,
        ats_scans: 0,
        period_start: new Date().toISOString()
    };

    // Check Monthly Reset
    const periodStart = new Date(currentUsage.period_start);
    const now = new Date();
    const isNewMonth = (now.getMonth() !== periodStart.getMonth()) || (now.getFullYear() !== periodStart.getFullYear()); // Simple month check

    if (isNewMonth) {
        // Reset usage if new month (and we are about to check limits, so update likely follows)
        // We will reset in increment function or here?
        // Let's rely on increment function to handle reset logic if needed, or return true here and let increment handle it.
        // Actually, check needs to consider reset.
        if (action === "download_resume") return true; // Assuming reset happened implicitly or will happen
        // Ideally we update DB on check? No, strictly read.
        // We'll treat "isNewMonth" as 0 usage.
        return true;
    }

    // Check specific limits
    switch (action) {
        case "create_resume":
            // Count existing resumes
            const { count: resumeCount } = await supabase
                .from("resumes")
                .select("*", { count: "exact", head: true })
                .eq("user_email", email);
            return (resumeCount || 0) < PLAN_LIMITS.FREE.RESUMES;

        case "create_cover_letter":
            const { count: clCount } = await supabase
                .from("cover_letters")
                .select("*", { count: "exact", head: true })
                .eq("user_email", email);
            return (clCount || 0) < PLAN_LIMITS.FREE.COVER_LETTERS;

        case "download_resume":
            if (isNewMonth) return true;
            return (currentUsage.resume_downloads || 0) < PLAN_LIMITS.FREE.RESUME_DOWNLOADS;

        case "download_cover_letter":
            if (isNewMonth) return true;
            return (currentUsage.cover_letter_downloads || 0) < PLAN_LIMITS.FREE.COVER_LETTER_DOWNLOADS;

        case "ats_scan":
            if (isNewMonth) return true;
            return (currentUsage.ats_scans || 0) < PLAN_LIMITS.FREE.ATS_SCANS;

        default:
            return true;
    }
}

export async function incrementUsage(action: "download_resume" | "download_cover_letter" | "ats_scan") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");
    const email = session.user.email;

    const { isPro } = await getUserSubscriptionStatus(email);
    if (isPro) return; // No tracking/limiting for pro

    // Fetch current usage
    const { data: usage } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_email", email)
        .single();

    const now = new Date();
    let currentUsage = usage || {
        resume_downloads: 0,
        cover_letter_downloads: 0,
        ats_scans: 0,
        period_start: now.toISOString()
    };

    // Check reset
    const periodStart = new Date(currentUsage.period_start);
    const isNewMonth = (now.getMonth() !== periodStart.getMonth()) || (now.getFullYear() !== periodStart.getFullYear());

    if (isNewMonth) {
        currentUsage = {
            resume_downloads: 0,
            cover_letter_downloads: 0,
            ats_scans: 0,
            period_start: now.toISOString()
        };
    }

    // Increment
    if (action === "download_resume") currentUsage.resume_downloads = (currentUsage.resume_downloads || 0) + 1;
    if (action === "download_cover_letter") currentUsage.cover_letter_downloads = (currentUsage.cover_letter_downloads || 0) + 1;
    if (action === "ats_scan") currentUsage.ats_scans = (currentUsage.ats_scans || 0) + 1;

    // Check if exceeded limit (after increment? or strict?)
    // If strict, we should have checked checkLimit() before calling this.
    // But this function implies "consume credit".

    // Save
    const { error } = await supabase.from("user_usage").upsert({
        user_email: email,
        ...currentUsage,
        updated_at: now.toISOString()
    });

    if (error) {
        console.error("Error updating usage:", error);
    }
}
