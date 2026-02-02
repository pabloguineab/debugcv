"use client";

import { ResumeData } from "@/types/resume";
import { ResumePreview as SimplePreview } from "./resume-preview";
import { ModernPreview } from "./templates/modern-preview";

interface ResumePreviewWrapperProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    onUpdate?: (updates: Partial<ResumeData>) => void;
    animate?: boolean;
}

/**
 * Wrapper component that renders the appropriate resume template based on data.template
 */
export function ResumePreviewWrapper(props: ResumePreviewWrapperProps) {
    const { data } = props;

    switch (data.template) {
        case "modern":
            return <ModernPreview {...props} />;
        case "harvard":
            // TODO: Implement Harvard template
            return <SimplePreview {...props} />;
        case "simple":
        default:
            return <SimplePreview {...props} />;
    }
}
