import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import { redirect } from "next/navigation";
import { getUserIdentity } from "@/lib/supabase";

import { fetchFullProfile } from "@/lib/actions/profile";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    // Check if new user (from session flag) or incomplete profile (missing password_hash check if needed, though isNewUser flag is cleaner for strictly first-time)
    // We cast to any because isNewUser is added in the session callback
    const isNewUser = (session.user as any)?.isNewUser;

    if (isNewUser) {
        redirect("/auth/onboarding");
    }

    // Fetch the real user identity from Supabase (in case it has been updated)
    let user = session.user;

    if (session.user?.email) {
        try {
            const savedIdentity = await getUserIdentity(session.user.email);
            if (savedIdentity && savedIdentity.name && savedIdentity.name !== savedIdentity.email) {
                // Override session user with saved identity
                user = {
                    ...session.user,
                    name: savedIdentity.name,
                    image: savedIdentity.image || session.user.image,
                };
            }
        } catch (error) {
            console.error("[Dashboard Layout] Error fetching user identity:", error);
        }
    }

    // Calculate profile completion status
    // Temporarily disabled to debug application error
    // const profileData = await fetchFullProfile();

    // Default to false if fetch fails or is null
    const completionStatus = {
        overview: false, // !!(profileData?.profile?.full_name && profileData?.profile?.bio),
        techStack: false, // (profileData?.profile?.tech_stack?.length || 0) > 0,
        experience: false, // (profileData?.experiences?.length || 0) > 0,
        projects: false, // (profileData?.projects?.length || 0) > 0,
        education: false, // (profileData?.educations?.length || 0) > 0,
        certifications: false, // (profileData?.certifications?.length || 0) > 0,
    };

    return (
        <DashboardLayoutClient user={user} completionStatus={completionStatus}>
            {children}
        </DashboardLayoutClient>
    );
}
