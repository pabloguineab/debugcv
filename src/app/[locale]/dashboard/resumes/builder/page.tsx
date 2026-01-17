"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResumeData, ResumeScore } from "@/types/resume";
import { ResumePreview } from "@/components/resume-builder/resume-preview";
import { ResumeEditorSidebar } from "@/components/resume-builder/resume-editor-sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Download, Loader2, Pencil, Check } from "lucide-react";

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
    projects: [],
    certifications: [],
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
    const [isEditingName, setIsEditingName] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isTailoring, setIsTailoring] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    
    // Job description from URL params (passed from the creation dialog)
    const jobDescription = searchParams.get("description") || "";
    const jobTitle = searchParams.get("job") || "";

    // Load user profile data to pre-fill resume
    useEffect(() => {
        async function loadProfileAndTailor() {
            setIsLoadingProfile(true);
            
            try {
                // Fetch user profile data
                const { fetchFullProfile } = await import("@/lib/actions/profile");
                const profileData = await fetchFullProfile();
                
                if (!profileData || !profileData.profile) {
                    // No profile, use empty resume
                    setIsLoadingProfile(false);
                    return;
                }
                
                const { profile, experiences, educations, projects, certifications } = profileData;
                
                // Map profile data to ResumeData format
                const mappedPersonalInfo = {
                    fullName: profile.full_name || "",
                    email: profile.user_email || "",
                    phone: profile.phone_number || "",
                    location: profile.location || "",
                    profileUrl: profile.linkedin_user || profile.portfolio_url || ""
                };
                
                const mappedExperience = experiences?.map((exp: any) => ({
                    id: exp.id || crypto.randomUUID(),
                    company: exp.company_name || "",
                    title: exp.title || "",
                    location: exp.location || exp.country || "",
                    startDate: `${exp.start_month || ""} ${exp.start_year || ""}`.trim(),
                    endDate: exp.is_current ? "" : `${exp.end_month || ""} ${exp.end_year || ""}`.trim(),
                    current: exp.is_current || false,
                    bullets: exp.description ? exp.description.split("\n").filter((b: string) => b.trim()) : []
                })) || [];
                
                const mappedEducation = educations?.map((edu: any) => ({
                    id: edu.id || crypto.randomUUID(),
                    institution: edu.school || "",
                    degree: edu.degree || "",
                    field: edu.field_of_study || "",
                    location: "",
                    startDate: edu.start_year || "",
                    endDate: edu.is_current ? "Present" : (edu.end_year || "")
                })) || [];
                
                const mappedProjects = projects?.map((proj: any) => ({
                    id: proj.id || crypto.randomUUID(),
                    name: proj.name || "",
                    description: proj.description || "",
                    url: proj.project_url || "",
                    technologies: proj.technologies || []
                })) || [];
                
                const mappedCertifications = certifications?.map((cert: any) => ({
                    id: cert.id || crypto.randomUUID(),
                    name: cert.name || "",
                    issuer: cert.issuing_org || "",
                    issueDate: `${cert.issue_month || ""} ${cert.issue_year || ""}`.trim(),
                    expiryDate: cert.no_expiration ? "" : `${cert.expiration_month || ""} ${cert.expiration_year || ""}`.trim(),
                    credentialId: cert.credential_id || ""
                })) || [];
                
                const baseSkills = profile.tech_stack || [];
                
                // If we have job details, tailor the resume with AI
                if (jobTitle && jobDescription) {
                    setIsTailoring(true);
                    
                    try {
                        const response = await fetch("/api/resume/ai", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                action: "tailor-resume",
                                data: {
                                    profileData: {
                                        personalInfo: mappedPersonalInfo,
                                        bio: profile.bio,
                                        skills: baseSkills,
                                        experience: mappedExperience,
                                        education: mappedEducation,
                                        projects: mappedProjects,
                                        certifications: mappedCertifications
                                    },
                                    jobTitle,
                                    jobDescription
                                }
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success && result.data) {
                            const tailored = result.data;
                            
                            setResumeData(prev => ({
                                ...prev,
                                name: `Resume for ${jobTitle}`,
                                targetJob: jobTitle,
                                personalInfo: mappedPersonalInfo,
                                summary: tailored.summary || "",
                                skills: tailored.skills || baseSkills,
                                experience: tailored.experience || mappedExperience,
                                education: tailored.education || mappedEducation,
                                projects: tailored.projects || mappedProjects,
                                certifications: tailored.certifications || mappedCertifications,
                                updatedAt: new Date().toISOString()
                            }));
                        } else {
                            // Fallback to non-tailored
                            setResumeData(prev => ({
                                ...prev,
                                personalInfo: mappedPersonalInfo,
                                skills: baseSkills,
                                experience: mappedExperience,
                                education: mappedEducation,
                                projects: mappedProjects,
                                certifications: mappedCertifications,
                                updatedAt: new Date().toISOString()
                            }));
                        }
                    } catch (error) {
                        console.error("Failed to tailor resume:", error);
                        // Use non-tailored data
                        setResumeData(prev => ({
                            ...prev,
                            personalInfo: mappedPersonalInfo,
                            skills: baseSkills,
                            experience: mappedExperience,
                            education: mappedEducation,
                            projects: mappedProjects,
                            certifications: mappedCertifications,
                            updatedAt: new Date().toISOString()
                        }));
                    } finally {
                        setIsTailoring(false);
                    }
                } else {
                    // No job details, just use profile data directly
                    setResumeData(prev => ({
                        ...prev,
                        personalInfo: mappedPersonalInfo,
                        skills: baseSkills,
                        experience: mappedExperience,
                        education: mappedEducation,
                        projects: mappedProjects,
                        certifications: mappedCertifications,
                        updatedAt: new Date().toISOString()
                    }));
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoadingProfile(false);
            }
        }
        
        loadProfileAndTailor();
    }, [jobTitle, jobDescription]);

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
        <div className="h-[calc(100vh-64px)] flex flex-col -mx-4 -mt-2 -mb-4">
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
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={resumeData.name}
                                onChange={(e) => handleUpdate({ name: e.target.value })}
                                onBlur={() => setIsEditingName(false)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setIsEditingName(false);
                                    }
                                }}
                                className="font-semibold text-lg bg-transparent border-b-2 border-primary outline-none"
                                style={{ width: `${Math.max(resumeData.name.length * 0.6 + 1, 6)}em` }}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setIsEditingName(true);
                                setTimeout(() => nameInputRef.current?.focus(), 0);
                            }}
                            className="flex items-center gap-2 group"
                        >
                            <h1 className="font-semibold text-lg">
                                {resumeData.name}
                            </h1>
                            <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    )}
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
                <div className="w-[400px] shrink-0 bg-background overflow-hidden">
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
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto p-6 flex items-start justify-center relative">
                    {(isLoadingProfile || isTailoring) && (
                        <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {isTailoring ? "Tailoring your resume..." : "Loading your profile..."}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {isTailoring 
                                            ? "AI is optimizing your resume for the job" 
                                            : "Please wait a moment"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="w-full h-fit">
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
