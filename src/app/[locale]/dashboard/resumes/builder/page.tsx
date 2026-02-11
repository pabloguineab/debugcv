"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResumeData, ResumeScore } from "@/types/resume";
import { ResumePreviewWrapper as ResumePreview } from "@/components/resume-builder/resume-preview-wrapper";
import { ResumeEditorSidebar } from "@/components/resume-builder/resume-editor-sidebar";
import { downloadResumePDF } from "@/components/resume-builder/resume-pdf";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Download, Loader2, Pencil, Check, Cloud, CloudOff } from "lucide-react";
import { saveResume as saveResumeToDb, getResume as getResumeFromDb } from "@/lib/actions/resumes";
import { ResumePreviewSkeleton } from "@/components/resume-builder/resume-preview-skeleton";
import { ResumeSidebarSkeleton } from "@/components/resume-builder/resume-sidebar-skeleton";
import { LimitModal } from "@/components/limit-modal";
import { UpgradePlanModal } from "@/components/upgrade-plan-modal";

// Helper function to normalize location format from "City, StateCode" to "City, CountryName"
// This handles legacy data where location was stored as "Madrid, MD" instead of "Madrid, Spain"
function normalizeLocation(location: string): string {
    if (!location) return "";

    // If the location already looks correct, return as is
    const parts = location.split(",").map(p => p.trim());
    if (parts.length !== 2) return location;

    const [city, suffix] = parts;

    // If suffix is longer than 2-3 characters, it's probably already a country name
    if (suffix && suffix.length > 3) return location;

    // If suffix is a 2-letter code, check if it's a known region code first
    if (suffix && suffix.length === 2) {
        // Spanish region codes (ISO 3166-2:ES) - check these BEFORE country codes
        // because some overlap with country codes (MD = Moldova, but also Madrid region)
        const spanishRegionCodes: Record<string, boolean> = {
            "MD": true,  // Madrid
            "CT": true,  // Catalonia
            "AN": true,  // Andalusia
            "AR": true,  // Aragón
            "AS": true,  // Asturias
            "IB": true,  // Balearic Islands
            "CN": true,  // Canary Islands
            "CB": true,  // Cantabria
            "CL": true,  // Castile and León
            "CM": true,  // Castile-La Mancha
            "EX": true,  // Extremadura
            "GA": true,  // Galicia
            "RI": true,  // La Rioja
            "MC": true,  // Murcia
            "NC": true,  // Navarra
            "PV": true,  // Basque Country
            "VC": true,  // Valencia
        };

        // Spanish cities commonly associated with region codes
        const spanishCities = ["madrid", "barcelona", "valencia", "sevilla", "seville", "bilbao", "málaga", "malaga", "zaragoza", "murcia", "palma", "las palmas", "alicante", "córdoba", "cordoba", "valladolid", "vigo", "gijón", "gijon", "hospitalet", "granada", "elche", "oviedo", "santa cruz", "badalona", "cartagena", "jerez", "sabadell", "móstoles", "alcalá", "pamplona", "almería", "santander"];

        const cityLower = city.toLowerCase();
        const isSpanishCity = spanishCities.some(sc => cityLower.includes(sc));
        const isSpanishRegionCode = spanishRegionCodes[suffix];

        if (isSpanishCity || isSpanishRegionCode) {
            return `${city}, Spain`;
        }

        // US state codes
        const usStateCodes: Record<string, boolean> = {
            "AL": true, "AK": true, "AZ": true, "CA": true, "CO": true, "CT": true,
            "DE": true, "FL": true, "GA": true, "HI": true, "ID": true, "IL": true,
            "IN": true, "IA": true, "KS": true, "KY": true, "LA": true, "ME": true,
            "MA": true, "MI": true, "MN": true, "MS": true, "MO": true, "MT": true,
            "NE": true, "NV": true, "NH": true, "NJ": true, "NM": true, "NY": true,
            "NC": true, "ND": true, "OH": true, "OK": true, "OR": true, "PA": true,
            "RI": true, "SC": true, "SD": true, "TN": true, "TX": true, "UT": true,
            "VT": true, "VA": true, "WA": true, "WV": true, "WI": true, "WY": true,
            "DC": true,
        };

        const usCities = ["new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia", "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville", "san francisco", "columbus", "seattle", "denver", "boston", "detroit", "nashville", "portland", "las vegas", "oklahoma", "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa", "atlanta", "kansas city", "miami", "raleigh", "omaha", "cleveland", "tulsa", "minneapolis", "wichita", "arlington", "bakersfield", "aurora", "tampa", "honolulu", "anaheim", "pittsburgh", "lexington", "anchorage", "stockton", "corpus christi", "cincinnati", "saint paul", "greensboro", "newark", "plano", "henderson", "lincoln", "buffalo", "fort wayne", "jersey city", "chula vista", "orlando", "chandler", "riverside", "scottsdale", "reno", "gilbert", "boise", "orlando", "memphis", "louisville", "baltimore", "washington"];

        const cityLowerUS = city.toLowerCase();
        const isUSCity = usCities.some(uc => cityLowerUS.includes(uc));
        const isUSStateCode = usStateCodes[suffix];

        if (isUSCity || isUSStateCode) {
            return `${city}, USA`;
        }
    }

    return location;
}

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
    languages: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    template: "simple",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

// Pure function to extract keywords from job description
function extractJobKeywordsPure(text: string): Set<string> {
    if (!text) return new Set();

    const words = text.toLowerCase()
        .replace(/[^\w\s+#.-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);

    const phrases: string[] = [];
    const textLower = text.toLowerCase();
    const commonPhrases = [
        'machine learning', 'deep learning', 'data science', 'data engineering',
        'software engineer', 'full stack', 'front end', 'back end', 'frontend', 'backend',
        'project management', 'product management', 'agile', 'scrum',
        'cloud computing', 'aws', 'azure', 'gcp', 'google cloud',
        'ci/cd', 'devops', 'kubernetes', 'docker', 'microservices',
        'python', 'javascript', 'typescript', 'react', 'node.js', 'nodejs',
        'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
        'api', 'rest', 'graphql', 'grpc',
        'tensorflow', 'pytorch', 'keras', 'scikit-learn',
        'nlp', 'computer vision', 'ai', 'artificial intelligence',
        'data analysis', 'data visualization', 'tableau', 'power bi',
        'excel', 'powerpoint', 'leadership', 'communication',
        'problem solving', 'teamwork', 'collaboration'
    ];

    commonPhrases.forEach(phrase => {
        if (textLower.includes(phrase)) {
            phrases.push(phrase);
        }
    });

    return new Set([...words, ...phrases]);
}

// Pure function to calculate resume score - can be used during load and in component
// Pure function to calculate resume score - can be used during load and in component
function calculateResumeScorePure(data: ResumeData, jobDesc: string): number {
    const jobKeywords = extractJobKeywordsPure(jobDesc || '');
    const hasJobDescription = jobKeywords.size > 5;

    let totalScore = 0;

    // === PERSONAL INFO (15 points max) ===
    // Boosted baseline: Easy points for contact info
    const { personalInfo } = data;
    let personalScore = 0;
    if (personalInfo.fullName) personalScore += 5;
    if (personalInfo.email) personalScore += 4;
    if (personalInfo.phone) personalScore += 3;
    if (personalInfo.location) personalScore += 2;
    if (personalInfo.profileUrl || personalInfo.linkedin) personalScore += 5; // Bonus
    totalScore += Math.min(personalScore, 15);

    // === PROFESSIONAL SUMMARY (20 points max) ===
    let summaryScore = 0;
    if (data.summary) {
        const wordCount = data.summary.split(/\s+/).length;
        // Granular scoring for length
        if (wordCount >= 20) summaryScore += 10;
        else if (wordCount > 5) summaryScore += 5;

        // Keyword matching
        if (hasJobDescription) {
            const summaryLower = data.summary.toLowerCase();
            let matchCount = 0;
            jobKeywords.forEach(keyword => {
                if (summaryLower.includes(keyword)) matchCount++;
            });
            if (matchCount > 0) summaryScore += 5 + Math.min(matchCount * 2, 5);
        } else {
            summaryScore += 5; // Autoboost if no JD
        }
    }
    totalScore += Math.min(summaryScore, 20);

    // === SKILLS MATCHING (30 points max) ===
    // Granular: 2 points per skill to ensure reactivity when adding/removing
    let skillScore = 0;
    const skillCount = data.skills.length;

    if (skillCount > 0) {
        skillScore += skillCount * 2; // e.g. 5 skills = 10pts

        if (hasJobDescription) {
            const skillsLower = data.skills.map(s => s.toLowerCase());
            let skillMatches = 0;
            jobKeywords.forEach(keyword => {
                if (skillsLower.some(skill => skill.includes(keyword) || keyword.includes(skill))) {
                    skillMatches++;
                }
            });
            skillScore += skillMatches * 2; // Bonus for matches
        }
    }
    totalScore += Math.min(skillScore, 30);

    // === EXPERIENCE (30 points max) ===
    // Granular: Points per bullet point
    let expScore = 0;
    if (data.experience.length > 0) {
        expScore += 5; // Base for having any experience

        data.experience.forEach(exp => {
            expScore += 2; // Per role
            const bullets = exp.bullets || [];
            expScore += bullets.length * 1.5; // 1.5 pts per bullet

            bullets.forEach(bullet => {
                // Quality matches
                if (bullet.length >= 20 && bullet.length <= 200) expScore += 0.5;

                if (hasJobDescription) {
                    const bulletLower = bullet.toLowerCase();
                    let hasMatch = false;
                    jobKeywords.forEach(keyword => {
                        if (bulletLower.includes(keyword)) hasMatch = true;
                    });
                    if (hasMatch) expScore += 1;
                }
            });
        });
    }
    totalScore += Math.min(expScore, 30);

    // === EDUCATION (10 points max) ===
    let eduScore = 0;
    if (data.education.length > 0) {
        eduScore += 8;
        if (data.education.some(e => e.degree)) eduScore += 2;
    }
    totalScore += Math.min(eduScore, 10);

    // === PROJECTS & CERTIFICATIONS (15 points max) ===
    let extraScore = 0;
    if (data.projects.length > 0) extraScore += 5 + (data.projects.length * 2);
    if (data.certifications.length > 0) extraScore += 3 + (data.certifications.length * 2);
    totalScore += Math.min(extraScore, 15);

    // === CONSISTENCY BOOST ===
    // Ensure the score feels fair (approx +10-15 boost request)
    if (totalScore > 10) totalScore += 5;

    return Math.min(Math.round(totalScore), 100);
}

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
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isTailoring, setIsTailoring] = useState(false);
    // Start with animate=true only if creating new resume (no ID in URL)
    const [animatePreview, setAnimatePreview] = useState(() => !searchParams.get("id"));
    const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitFeature, setLimitFeature] = useState("");
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Job description from URL params (passed from the creation dialog)
    const [jobDescription, setJobDescription] = useState(() => searchParams.get("description") || "");
    const jobTitle = searchParams.get("job") || "";

    // Load user profile data to pre-fill resume
    useEffect(() => {
        async function loadData() {
            setIsLoadingProfile(true);

            try {
                // First try to load existing resume by ID
                const existingResume = await getResumeFromDb(resumeId);

                if (existingResume) {
                    let dataToLoad = existingResume.data;

                    // Load saved job description
                    if (existingResume.job_description) {
                        setJobDescription(existingResume.job_description);
                    }

                    // Load scores - or calculate heuristic if missing
                    if (existingResume.data.atsScore) {
                        setScore(existingResume.data.atsScore);
                        setDisplayedScore(existingResume.data.atsScore);
                        animationStartedRef.current = true;
                    } else {
                        // Calculate proper score for resumes that don't have one saved
                        // Use the same algorithm as calculateProgressiveScore for consistency
                        const jobDesc = existingResume.job_description || '';
                        const calculatedScore = calculateResumeScorePure(existingResume.data, jobDesc);

                        // Inject the score into the data so it gets saved by auto-save
                        dataToLoad = { ...existingResume.data, atsScore: calculatedScore };
                        setScore(calculatedScore);
                        setDisplayedScore(calculatedScore);
                        animationStartedRef.current = true;
                    }

                    setResumeData(dataToLoad);

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
                    location: normalizeLocation(profile.location || ""),
                    profileUrl: profile.portfolio_url || "",
                    linkedin: profile.linkedin_user ? `https://linkedin.com/in/${profile.linkedin_user}` : "",
                    github: profile.github_user ? `https://github.com/${profile.github_user}` : ""
                };

                const mappedExperience = experiences?.map((exp: any) => ({
                    id: exp.id || crypto.randomUUID(),
                    company: exp.company_name || "",
                    companyUrl: exp.company_url || "",
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
                    endDate: `${edu.end_month || ""} ${edu.end_year || ""}`.trim(),
                    website: edu.school_url || ""
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
                const baseLanguages = profile.languages || [];

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
                                    languages: baseLanguages,
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
                                languages: baseLanguages,
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
                            languages: baseLanguages,
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
                        languages: baseLanguages,
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
        // If template is changing, disable animation to prevent restart
        if (updates.template) {
            setAnimatePreview(false);
        }
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
                    resumeData.targetCompany,
                    jobDescription // Save the job description used for tailoring
                );
                if (result.success) {
                    setAutoSaveStatus("saved");
                    setLastSaved(new Date());
                } else {
                    console.error("Failed to save resume:", result.error);
                    if (result.error?.includes("limit")) {
                        setLimitFeature("Active Resumes");
                        setIsLimitModalOpen(true);
                    }
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
    }, [resumeData, resumeId, isLoadingProfile, jobDescription]);

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
                handleUpdate({ atsScore: result.data.overall });
            }
        } catch (error) {
            console.error("Failed to calculate score:", error);
        } finally {
            setIsCalculatingScore(false);
        }
    }, [resumeData, jobDescription]);

    // Extract keywords from job description for matching
    const extractJobKeywords = useCallback((text: string): Set<string> => {
        return extractJobKeywordsPure(text);
    }, []);

    // Calculate intelligent resume score based on quality AND job matching
    const calculateProgressiveScore = useCallback(() => {
        return calculateResumeScorePure(resumeData, jobDescription || '');
    }, [resumeData, jobDescription]);




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
                // Set immediately - prefer saved score if available
                const finalScore = resumeData.atsScore || targetScore;
                setDisplayedScore(finalScore);
                setScore(finalScore);
                animationStartedRef.current = true;

                // Sync: If we are displaying a heuristic score that isn't saved yet, save it
                // This ensures the Dashboard shows the same score as the Builder
                if (!resumeData.atsScore && targetScore > 0) {
                    handleUpdate({ atsScore: targetScore });
                }

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
                        // Score animation complete - disable animation for future changes
                        setAnimatePreview(false);
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

    // Download resume as PDF using react-pdf
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Check & Track Usage Limit
            const { trackUsageAction } = await import("@/lib/actions/usage");
            const result = await trackUsageAction("download_resume");

            if (!result.success) {
                // Determine if user has Free plan to show upgrade message
                if (result.error?.includes("limit reached")) {
                    setLimitFeature("Resume Downloads");
                    setIsLimitModalOpen(true);
                } else {
                    alert(result.error || "Usage limit reached.");
                }
                return;
            }

            await downloadResumePDF(resumeData);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
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
        <div className="h-[calc(100vh-64px)] flex flex-col -mx-4 -mt-2 -mb-4 relative">
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
                    <Button onClick={handleDownload} className="gap-1" disabled={isDownloading}>
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Download resume
                            </>
                        )}
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
                            jobDescription={jobDescription}
                            onJobDescriptionChange={setJobDescription}
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
            {/* Modals */}
            <LimitModal
                open={isLimitModalOpen}
                onOpenChange={setIsLimitModalOpen}
                feature={limitFeature}
                onUpgrade={() => {
                    setIsUpgradeModalOpen(true);
                    setTimeout(() => setIsLimitModalOpen(false), 300);
                }}
            />
            <UpgradePlanModal
                open={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentPlan="Free"
            />
        </div>
    );
}
