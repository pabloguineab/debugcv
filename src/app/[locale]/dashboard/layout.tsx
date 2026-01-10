"use client";

import { useSession } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    return (
        <SidebarProvider>
            <AppSidebar user={session?.user} />
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
