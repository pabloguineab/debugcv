import { auth } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // Optional: Protect route server-side if needed, though middleware likely handles it
    if (!session?.user) {
        // redirect("/auth/signin"); // Uncomment if strict server-side protection is desired
    }

    return (
        <DashboardLayoutClient user={session?.user}>
            {children}
        </DashboardLayoutClient>
    );
}
