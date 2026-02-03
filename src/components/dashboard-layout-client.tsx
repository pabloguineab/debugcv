"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ReferFriendModal } from "@/components/refer-friend-modal";
import { UploadResumeModal } from "@/components/upload-resume-modal";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";
import { ProfileCompletionProvider } from "@/contexts/profile-completion-context";

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
            <ProfileCompletionProvider>
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
                        <div className="flex flex-1 flex-col gap-4 px-4 pt-2 pb-4 min-h-[calc(100vh-4rem)]">
                            {children}
                        </div>
                    </SidebarInset>

                    <ReferFriendModal
                        open={isReferModalOpen}
                        onClose={() => setIsReferModalOpen(false)}
                        userName={user?.name || undefined}
                    />
                    <UploadResumeModal
                        open={isUploadModalOpen}
                        onClose={() => setIsUploadModalOpen(false)}
                    />
                </SidebarProvider>
            </ProfileCompletionProvider>
        </BreadcrumbProvider>
    );
}
