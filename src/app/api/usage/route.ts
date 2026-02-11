
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { PLAN_LIMITS, getUserSubscriptionStatus } from "@/lib/limits";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const email = session.user.email;

        // Get Subscription Status
        const { isPro } = await getUserSubscriptionStatus(email);

        // Get Usage Counts from DB
        const { data: usage } = await supabase
            .from("user_usage")
            .select("*")
            .eq("user_email", email)
            .single();

        // Get Item Counts
        const { count: resumeCount } = await supabase
            .from("resumes")
            .select("*", { count: "exact", head: true })
            .eq("user_email", email);

        const { count: clCount } = await supabase
            .from("cover_letters")
            .select("*", { count: "exact", head: true })
            .eq("user_email", email);

        // Calculate usage object
        const currentUsage = {
            resumes: resumeCount || 0,
            coverLetters: clCount || 0,
            resumeDownloads: usage?.resume_downloads || 0,
            coverLetterDownloads: usage?.cover_letter_downloads || 0,
            atsScans: usage?.ats_scans || 0,
            periodStart: usage?.period_start
        };

        const limits = isPro ? PLAN_LIMITS.PRO : PLAN_LIMITS.FREE;

        return NextResponse.json({
            isPro,
            usage: currentUsage,
            limits
        });

    } catch (error) {
        console.error("Error fetching usage:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
