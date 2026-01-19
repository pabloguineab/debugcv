"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResumeData, ResumeScore } from "@/types/resume";
import { ResumePreview } from "@/components/resume-builder/resume-preview";
import { ResumeEditorSidebar } from "@/components/resume-builder/resume-editor-sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Download, Loader2, Pencil, Check, Cloud, CloudOff } from "lucide-react";
import { saveResume as saveResumeToDb, getResume as getResumeFromDb } from "@/lib/actions/resumes";
import { ResumePreviewSkeleton } from "@/components/resume-builder/resume-preview-skeleton";
import { ResumeSidebarSkeleton } from "@/components/resume-builder/resume-sidebar-skeleton";

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
    
    // Resume ID for persistence (from URL or generate new)
    const [resumeId] = useState(() => {
        return searchParams.get("id") || crypto.randomUUID();
    });
    
    const [resumeData, setResumeData] = useState<ResumeData>(() => {
        const targetJob = searchParams.get("job") || undefined;
        return createEmptyResume(targetJob);
    });
    
    // Score starts at 0 and builds up progressively
    const [score, setScore] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCalculatingScore, setIsCalculatingScore] = useState(false);
    const [activeSection, setActiveSection] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isTailoring, setIsTailoring] = useState(false);
    // Start with animate=true only if creating new resume (no ID in URL)
    const [animatePreview, setAnimatePreview] = useState(() => !searchParams.get("id"));
    const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Job description from URL params (passed from the creation dialog)
    const jobDescription = searchParams.get("description") || "";
    const jobTitle = searchParams.get("job") || "";

    // Load user profile data to pre-fill resume
    useEffect(() => {
        async function loadData() {
            setIsLoadingProfile(true);
            
            try {
                // First try to load existing resume by ID
                const existingResume = await getResumeFromDb(resumeId);
                
                if (existingResume) {
                    setResumeData(existingResume.data);
                    // Disable animation for existing resumes
                    setAnimatePreview(false); 
                    setIsLoadingProfile(false);
                    return; // Stop here, don't overwrite with profile data
                }

                // If loading from profile (New Resume flow)
                // Fetch user profile data
                const { fetchFullProfile } = await import("@/lib/actions/profile");
                const profileData = await fetchFullProfile();
                
                if (!profileData || !profileData.profile) {
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
                    location: edu.location || "",
                    startDate: `${edu.start_month || ""} ${edu.start_year || ""}`.trim(),
                    endDate: `${edu.end_month || ""} ${edu.end_year || ""}`.trim()
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
                        
                        if (response.ok) {
                            const result = await response.json();
                            if (result.success && result.data) {
                                setResumeData(prev => ({
                                    ...prev,
                                    name: jobTitle,
                                    targetJob: jobTitle,
                                    targetCompany: result.data.companyName || undefined,
                                    personalInfo: mappedPersonalInfo,
                                    summary: result.data.summary || "",
                                    skills: result.data.skills || baseSkills,
                                    experience: result.data.experience || mappedExperience,
                                    education: result.data.education || mappedEducation,
                                    projects: result.data.projects || mappedProjects,
                                    certifications: result.data.certifications || mappedCertifications,
                                    updatedAt: new Date().toISOString()
                                }));
                                // Ensure animation is on for new creation
                                setAnimatePreview(true);
                            }
                        } else {
                            // Fallback to non-tailored if AI fails
                             setResumeData(prev => ({
                                ...prev,
                                personalInfo: mappedPersonalInfo,
                                summary: profile.bio || "",
                                skills: baseSkills,
                                experience: mappedExperience,
                                education: mappedEducation,
                                projects: mappedProjects,
                                certifications: mappedCertifications,
                                updatedAt: new Date().toISOString()
                            }));
                            setAnimatePreview(true);
                        }
                    } catch (error) {
                        console.error("Failed to tailor resume:", error);
                        // Use non-tailored data
                        setResumeData(prev => ({
                            ...prev,
                            personalInfo: mappedPersonalInfo,
                            summary: profile.bio || "",
                            skills: baseSkills,
                            experience: mappedExperience,
                            education: mappedEducation,
                            projects: mappedProjects,
                            certifications: mappedCertifications,
                            updatedAt: new Date().toISOString()
                        }));
                        setAnimatePreview(true);
                    } finally {
                        setIsTailoring(false);
                    }
                } else {
                    // No tailoring needed, set data immediately
                    setResumeData(prev => ({
                        ...prev,
                        personalInfo: mappedPersonalInfo,
                        summary: profile.bio || "",
                        skills: baseSkills,
                        experience: mappedExperience,
                        education: mappedEducation,
                        projects: mappedProjects,
                        certifications: mappedCertifications,
                        updatedAt: new Date().toISOString()
                    }));
                }
                
                // Animation is already set to true on mount, no need to change it

            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoadingProfile(false);
            }
        }
        
        loadData();
    }, [jobTitle, jobDescription]);

    // Update resume data
    const handleUpdate = useCallback((updates: Partial<ResumeData>) => {
        setResumeData(prev => ({
            ...prev,
            ...updates,
            updatedAt: new Date().toISOString()
        }));
        // Mark as unsaved when changes are made
        setAutoSaveStatus("unsaved");
    }, []);

    // Auto-save effect with debounce (save 1.5 seconds after last change)
    useEffect(() => {
        // Don't save while still loading profile
        if (isLoadingProfile) return;
        
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Set new timeout for saving
        saveTimeoutRef.current = setTimeout(async () => {
            setAutoSaveStatus("saving");
            try {
                const result = await saveResumeToDb(
                    resumeId,
                    resumeData.name,
                    resumeData,
                    resumeData.targetJob,
                    resumeData.targetCompany
                );
                if (result.success) {
                    setAutoSaveStatus("saved");
                    setLastSaved(new Date());
                } else {
                    console.error("Failed to save resume:", result.error);
                    setAutoSaveStatus("unsaved");
                }
            } catch (error) {
                console.error("Failed to save resume:", error);
                setAutoSaveStatus("unsaved");
            }
        }, 1500);
        
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [resumeData, resumeId, isLoadingProfile]);

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

    // Calculate intelligent resume score based on quality criteria
    const calculateProgressiveScore = useCallback(() => {
        let totalScore = 0;
        
        // === PERSONAL INFO (15 points max) ===
        const { personalInfo } = resumeData;
        let personalScore = 0;
        if (personalInfo.fullName) personalScore += 4;
        if (personalInfo.email) personalScore += 4;
        if (personalInfo.phone) personalScore += 3;
        if (personalInfo.location) personalScore += 2;
        if (personalInfo.profileUrl) personalScore += 2;
        totalScore += Math.min(personalScore, 15);
        
        // === PROFESSIONAL SUMMARY (15 points max) ===
        let summaryScore = 0;
        if (resumeData.summary) {
            const wordCount = resumeData.summary.split(/\s+/).length;
            if (wordCount >= 40 && wordCount <= 80) {
                summaryScore = 15; // Ideal length
            } else if (wordCount >= 25 && wordCount < 40) {
                summaryScore = 12; // Good but could be longer
            } else if (wordCount > 80 && wordCount <= 120) {
                summaryScore = 12; // Good but could be shorter
            } else if (wordCount >= 15 && wordCount < 25) {
                summaryScore = 8; // Too short
            } else if (wordCount > 120) {
                summaryScore = 8; // Too long
            } else if (wordCount > 0) {
                summaryScore = 4; // Minimal
            }
        }
        totalScore += summaryScore;
        
        // === EXPERIENCE (30 points max) ===
        let expScore = 0;
        if (resumeData.experience.length > 0) {
            // Base points for having experience
            expScore += Math.min(resumeData.experience.length * 5, 15);
            
            // Quality points for bullet points
            let totalBullets = 0;
            let qualityBullets = 0;
            resumeData.experience.forEach(exp => {
                const bullets = exp.bullets || [];
                totalBullets += bullets.length;
                bullets.forEach(bullet => {
                    // Quality bullet: 20-100 chars, starts with action verb
                    if (bullet.length >= 20 && bullet.length <= 150) {
                        qualityBullets++;
                    }
                });
            });
            
            if (totalBullets >= 6) expScore += 10;
            else if (totalBullets >= 3) expScore += 6;
            else if (totalBullets > 0) expScore += 3;
            
            // Bonus for quality bullets
            if (qualityBullets >= 4) expScore += 5;
            else if (qualityBullets >= 2) expScore += 3;
        }
        totalScore += Math.min(expScore, 30);
        
        // === EDUCATION (10 points max) ===
        let eduScore = 0;
        if (resumeData.education.length > 0) {
            eduScore += 7;
            
            // Bonus for complete info
            const hasCompleteEdu = resumeData.education.some(
                edu => edu.institution && edu.degree && edu.field
            );
            if (hasCompleteEdu) eduScore += 3;
        }
        totalScore += Math.min(eduScore, 10);
        
        // === SKILLS (15 points max) ===
        let skillScore = 0;
        const skillCount = resumeData.skills.length;
        if (skillCount >= 8 && skillCount <= 15) {
            skillScore = 15; // Ideal range
        } else if (skillCount >= 5 && skillCount < 8) {
            skillScore = 12; // Good
        } else if (skillCount > 15 && skillCount <= 20) {
            skillScore = 12; // Slightly too many
        } else if (skillCount >= 3 && skillCount < 5) {
            skillScore = 8; // Too few
        } else if (skillCount > 20) {
            skillScore = 8; // Too many
        } else if (skillCount > 0) {
            skillScore = 4; // Minimal
        }
        totalScore += skillScore;
        
        // === PROJECTS (8 points max) ===
        let projScore = 0;
        if (resumeData.projects.length > 0) {
            projScore += Math.min(resumeData.projects.length * 3, 6);
            
            // Bonus for complete projects
            const hasCompleteProj = resumeData.projects.some(
                proj => proj.name && proj.description && proj.technologies?.length > 0
            );
            if (hasCompleteProj) projScore += 2;
        }
        totalScore += Math.min(projScore, 8);
        
        // === CERTIFICATIONS (7 points max) ===
        let certScore = 0;
        if (resumeData.certifications.length > 0) {
            certScore += Math.min(resumeData.certifications.length * 3, 5);
            
            // Bonus for complete certifications
            const hasCompleteCert = resumeData.certifications.some(
                cert => cert.name && cert.issuer && cert.issueDate
            );
            if (hasCompleteCert) certScore += 2;
        }
        totalScore += Math.min(certScore, 7);
        
        // Total possible: 100 points
        // Return the actual score (no artificial inflation)
        return Math.min(totalScore, 100);
    }, [resumeData]);

    // Animated score that gradually increases to target
    const [displayedScore, setDisplayedScore] = useState(0);
    const targetScoreRef = useRef(0);
    const animationStartedRef = useRef(false);

    // Update target score when sections complete
    useEffect(() => {
        const progressiveScore = calculateProgressiveScore();
        targetScoreRef.current = progressiveScore;
    }, [calculateProgressiveScore]);

    // Animate score increase when data loads (after loading finishes)
    useEffect(() => {
        if (!isLoadingProfile && !isTailoring) {
            
            const targetScore = calculateProgressiveScore();
            
            // If checking existing resume (no animation needed)
            if (!animatePreview) {
                // Set immediately
                setDisplayedScore(targetScore);
                setScore(targetScore);
                animationStartedRef.current = true;
                
                // Trigger AI score calculation if high enough
                if (targetScore >= 60 && !isCalculatingScore) {
                     // Debounce AI calculation? Or just let user trigger it manually?
                     // For now let's keep it manual or on specific triggers to avoid spamming
                }
                return;
            }

            // Only start the slow animation once for new resumes
            if (!animationStartedRef.current) {
                animationStartedRef.current = true;
                
                // Animate from 0 to target score over ~30 seconds (matching full typewriter duration)
                const duration = 30000; // 30 seconds to cover full CV animation
                const steps = 100; // More steps for smoother animation
                const stepDuration = duration / steps;
                const increment = targetScore / steps;
                
                let currentStep = 0;
                const interval = setInterval(() => {
                    currentStep++;
                    const newScore = Math.min(Math.round(increment * currentStep), targetScore);
                    setDisplayedScore(newScore);
                    setScore(newScore);
                    
                    if (currentStep >= steps) {
                        clearInterval(interval);
                        // Score animation complete - using local algorithm only
                    }
                }, stepDuration);
                
                return () => clearInterval(interval);
            } else {
                // If animation already finished but score changed due to edits, update immediately
                // Or maybe smooth transition? For now immediate is better UX for editing
                setDisplayedScore(targetScore);
                setScore(targetScore);
            }
        }
    }, [isLoadingProfile, isTailoring, calculateProgressiveScore, animatePreview]);

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
                    {resumeData.targetCompany && (
                        <span className="text-sm text-muted-foreground">
                            — Targeting: {resumeData.targetCompany}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Auto-save indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {autoSaveStatus === "saving" && (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                            </>
                        )}
                        {autoSaveStatus === "saved" && (
                            <>
                                <Cloud className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-green-600">Saved</span>
                            </>
                        )}
                        {autoSaveStatus === "unsaved" && (
                            <>
                                <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-amber-600">Unsaved</span>
                            </>
                        )}
                    </div>
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
                    {(isLoadingProfile || isTailoring) ? (
                        <ResumeSidebarSkeleton />
                    ) : (
                        <ResumeEditorSidebar
                            data={resumeData}
                            score={displayedScore}
                            onUpdate={handleUpdate}
                            onGenerateSummary={handleGenerateSummary}
                            isGenerating={isGenerating}
                            activeSection={activeSection}
                        />
                    )}
                </div>

                {/* Preview */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto p-6 flex items-start justify-center relative">
                    <div className="w-full h-fit">
                        {(isLoadingProfile || isTailoring) ? (
                            <ResumePreviewSkeleton />
                        ) : (
                            <ResumePreview
                                data={resumeData}
                                onFieldClick={handleFieldClick}
                                onUpdate={handleUpdate}
                                animate={animatePreview}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
