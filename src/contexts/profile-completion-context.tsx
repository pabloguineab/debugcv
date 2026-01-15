"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchFullProfile } from "@/lib/actions/profile";

export interface CompletionStatus {
    overview: boolean;
    techStack: boolean;
    experience: boolean;
    projects: boolean;
    education: boolean;
    certifications: boolean;
    totalProgress: number;
}

interface ProfileCompletionContextType {
    status: CompletionStatus | null;
    isLoading: boolean;
    refreshCompletionStatus: () => Promise<void>;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | undefined>(undefined);

export function ProfileCompletionProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<CompletionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshCompletionStatus = async () => {
        try {
            const data = await fetchFullProfile();
            if (data) {
                const newStatus = {
                    overview: !!(data.profile?.full_name && data.profile?.bio),
                    techStack: (data.profile?.tech_stack?.length || 0) > 0,
                    experience: (data.experiences?.length || 0) > 0,
                    projects: (data.projects?.length || 0) > 0,
                    education: (data.educations?.length || 0) > 0,
                    certifications: (data.certifications?.length || 0) > 0,
                    totalProgress: 0 // Will verify calculation below
                };

                // Calculate percentage
                const completedCount = [
                    newStatus.overview,
                    newStatus.techStack,
                    newStatus.experience,
                    newStatus.projects,
                    newStatus.education,
                    newStatus.certifications
                ].filter(Boolean).length;

                newStatus.totalProgress = (completedCount / 6) * 100;

                setStatus(newStatus);
            }
        } catch (error) {
            console.error("Failed to fetch profile completion status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshCompletionStatus();
    }, []);

    return (
        <ProfileCompletionContext.Provider value={{ status, isLoading, refreshCompletionStatus }}>
            {children}
        </ProfileCompletionContext.Provider>
    );
}

export function useProfileCompletion() {
    const context = useContext(ProfileCompletionContext);
    if (context === undefined) {
        throw new Error("useProfileCompletion must be used within a ProfileCompletionProvider");
    }
    return context;
}
