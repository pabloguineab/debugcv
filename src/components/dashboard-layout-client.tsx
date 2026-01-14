"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ReferFriendModal } from "@/components/refer-friend-modal";
import { UploadResumeModal } from "@/components/upload-resume-modal";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";

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
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    return (
        <BreadcrumbProvider>
            <SidebarProvider>
                <AppSidebar
                    user={user}
                    onOpenReferModal={() => {
                        setIsReferModalOpen(true);
                        setIsUploadModalOpen(false);
                    }}
                    onOpenUploadModal={() => {
                        setIsUploadModalOpen(true);
                        setIsReferModalOpen(false);
                    }}
                />
                <SidebarInset>
                    <DashboardHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4 min-h-[calc(100vh-4rem)]">
                        {children}
                    </div>
                    <ReferFriendModal
                        open={isReferModalOpen}
                        onClose={() => setIsReferModalOpen(false)}
                    />
                    <UploadResumeModal
                        open={isUploadModalOpen}
                        onClose={() => setIsUploadModalOpen(false)}
                    />
                </SidebarInset>
            </SidebarProvider>
        </BreadcrumbProvider>
    );
}
