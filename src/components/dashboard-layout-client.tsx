"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ReferFriendModal } from "@/components/refer-friend-modal";
import { UploadResumeModal } from "@/components/upload-resume-modal";
import { OnboardingModal } from "@/components/onboarding-modal";

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
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    // Local state for user to reflect updates immediately
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        // If user is logged in but has no name (or name is email), show onboarding
        if (currentUser && (!currentUser.name || currentUser.name === currentUser.email)) {
            setIsOnboardingOpen(true);
        }
    }, [currentUser]);

    const handleOnboardingComplete = (fullName: string) => {
        setCurrentUser(prev => prev ? { ...prev, name: fullName } : prev);
        // Here you would also likely trigger a session update
    };

    return (
        <SidebarProvider>
            <AppSidebar
                user={currentUser}
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
                <OnboardingModal
                    open={isOnboardingOpen}
                    onOpenChange={setIsOnboardingOpen}
                    onComplete={handleOnboardingComplete}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}
