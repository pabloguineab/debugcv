"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ReferFriendModal } from "@/components/refer-friend-modal";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
    const [isReferModalOpen, setIsReferModalOpen] = useState(false);

    return (
        <SidebarProvider>
            <AppSidebar user={user} onOpenReferModal={() => setIsReferModalOpen(true)} />
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
                <ReferFriendModal
                    open={isReferModalOpen}
                    onClose={() => setIsReferModalOpen(false)}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}
