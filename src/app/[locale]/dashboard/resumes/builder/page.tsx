"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResumeData, ResumeScore } from "@/types/resume";
import { ResumePreview } from "@/components/resume-builder/resume-preview";
import { ResumeEditorSidebar } from "@/components/resume-builder/resume-editor-sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Download, Loader2 } from "lucide-react";

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

// Default empty resume
const createEmptyResume = (targetJob?: string, jobDescription?: string): ResumeData => ({
    id: generateId(),
    name: targetJob ? `Resume for ${targetJob}` : "New Resume",
    targetJob: targetJob || undefined,
    personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        profileUrl: ""
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    template: "harvard",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

export default function ResumeBuilderPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [resumeData, setResumeData] = useState<ResumeData>(() => {
        const targetJob = searchParams.get("job") || undefined;
        return createEmptyResume(targetJob);
    });
    
    const [score, setScore] = useState(65);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCalculatingScore, setIsCalculatingScore] = useState(false);
    const [activeSection, setActiveSection] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    
    // Job description from URL params (passed from the creation dialog)
    const jobDescription = searchParams.get("description") || "";
    const jobTitle = searchParams.get("job") || "";

    // Load user profile data to pre-fill resume
    useEffect(() => {
        // TODO: Load user's profile data from the database
        // For now, we'll start with empty data
    }, []);

    // Update resume data
    const handleUpdate = useCallback((updates: Partial<ResumeData>) => {
        setResumeData(prev => ({
            ...prev,
            ...updates,
            updatedAt: new Date().toISOString()
        }));
    }, []);

    // Generate summary with AI
    const handleGenerateSummary = useCallback(async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/resume/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generate-summary",
                    data: {
                        fullName: resumeData.personalInfo.fullName,
                        targetJob: resumeData.targetJob || jobTitle,
                        skills: resumeData.skills,
                        experience: resumeData.experience,
                        jobDescription: jobDescription
                    }
                })
            });
            
            const result = await response.json();
            if (result.success) {
                handleUpdate({ summary: result.data });
            }
        } catch (error) {
            console.error("Failed to generate summary:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [resumeData, jobTitle, jobDescription, handleUpdate]);

    // Calculate resume score
    const calculateScore = useCallback(async () => {
        setIsCalculatingScore(true);
        try {
            const response = await fetch("/api/resume/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "calculate-score",
                    data: {
                        resumeData,
                        jobDescription
                    }
                })
            });
            
            const result = await response.json();
            if (result.success && result.data.overall) {
                setScore(result.data.overall);
            }
        } catch (error) {
            console.error("Failed to calculate score:", error);
        } finally {
            setIsCalculatingScore(false);
        }
    }, [resumeData, jobDescription]);

    // Recalculate score when resume changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resumeData.personalInfo.fullName && resumeData.summary) {
                calculateScore();
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [resumeData, calculateScore]);

    // Handle field click in preview
    const handleFieldClick = (field: string, index?: number) => {
        setActiveSection(field);
        // Scroll to section in sidebar
    };

    // Download resume as PDF
    const handleDownload = async () => {
        // TODO: Implement PDF generation
        // For now, just log the data
        console.log("Download resume:", resumeData);
        alert("PDF download coming soon!");
    };

    // Save resume
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Save to database
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Saved:", resumeData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/resumes")}
                        className="gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <h1 className="font-semibold text-lg">
                        {resumeData.name}
                    </h1>
                    {jobTitle && (
                        <span className="text-sm text-muted-foreground">
                            — Targeting: {jobTitle}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                    </Button>
                    <Button onClick={handleDownload} className="gap-1">
                        <Download className="w-4 h-4" />
                        Download resume
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-[400px] shrink-0 border-r bg-background overflow-hidden">
                    <ResumeEditorSidebar
                        data={resumeData}
                        score={score}
                        onUpdate={handleUpdate}
                        onGenerateSummary={handleGenerateSummary}
                        isGenerating={isGenerating}
                        activeSection={activeSection}
                    />
                </div>

                {/* Preview */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto p-8 flex justify-center">
                    <div className="max-w-[850px] w-full">
                        <ResumePreview
                            data={resumeData}
                            onFieldClick={handleFieldClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
