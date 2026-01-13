import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import { redirect } from "next/navigation";
import { getUserIdentity } from "@/lib/supabase";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
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

    return (
        <DashboardLayoutClient user={user}>
            {children}
        </DashboardLayoutClient>
    );
}
