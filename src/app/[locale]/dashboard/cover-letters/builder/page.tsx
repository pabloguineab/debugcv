"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Loader2, Sparkles, Check, Cloud, Copy } from "lucide-react";
import { saveCoverLetter, getCoverLetter } from "@/lib/actions/cover-letters";
import { getResume } from "@/lib/actions/resumes";
import { ResumeData } from "@/types/resume";

export default function CoverLetterBuilderPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const resumeId = searchParams.get("resume");
    const existingId = searchParams.get("id");

    const [coverLetterId] = useState(() => existingId || crypto.randomUUID());
    const [name, setName] = useState("Cover Letter");
    const [content, setContent] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [targetJob, setTargetJob] = useState("");
    const [targetCompany, setTargetCompany] = useState("");
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load existing cover letter or resume data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            try {
                // If editing existing cover letter
                if (existingId) {
                    const coverLetter = await getCoverLetter(existingId);
                    if (coverLetter) {
                        setName(coverLetter.name);
                        setContent(coverLetter.content);
                        setJobDescription(coverLetter.job_description || "");
                        setTargetJob(coverLetter.target_job || "");
                        setTargetCompany(coverLetter.target_company || "");

                        // Load associated resume if exists
                        if (coverLetter.resume_id) {
                            const resume = await getResume(coverLetter.resume_id);
                            if (resume?.data) {
                                setResumeData(resume.data as ResumeData);
                            }
                        }
                    }
                }
                // If creating from resume
                else if (resumeId) {
                    const resume = await getResume(resumeId);
                    if (resume) {
                        const data = resume.data as ResumeData;
                        setResumeData(data);
                        setTargetJob(resume.target_job || data.targetJob || data.name || "");
                        setTargetCompany(resume.target_company || data.targetCompany || "");
                        setName(`Cover Letter for ${resume.target_company || data.targetCompany || resume.target_job || data.targetJob || "Position"}`);

                        // Load job description from resume if it was tailored
                        if (resume.job_description) {
                            setJobDescription(resume.job_description);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [existingId, resumeId]);

    // Auto-save with debounce
    const saveToDb = useCallback(async () => {
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            await saveCoverLetter(
                coverLetterId,
                name,
                content,
                resumeId || undefined,
                targetJob,
                targetCompany,
                jobDescription
            );
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Error saving:", error);
        } finally {
            setIsSaving(false);
        }
    }, [coverLetterId, name, content, resumeId, targetJob, targetCompany, jobDescription]);

    // Debounced auto-save
    useEffect(() => {
        if (content.trim()) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(saveToDb, 2000);
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [content, saveToDb]);

    // Generate cover letter with AI
    const generateCoverLetter = async () => {
        if (!resumeData) {
            alert("Please select a resume first");
            return;
        }

        if (!jobDescription.trim()) {
            alert("Please paste the job description first");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/resume/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generate-cover-letter",
                    data: {
                        resumeData,
                        jobTitle: targetJob,
                        companyName: targetCompany,
                        jobDescription
                    }
                })
            });

            const result = await response.json();
            if (result.success && result.data) {
                setContent(result.data);
                // Save immediately after generation
                setTimeout(saveToDb, 500);
            } else {
                alert("Failed to generate cover letter. Please try again.");
            }
        } catch (error) {
            console.error("Error generating:", error);
            alert("Failed to generate cover letter. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    // Download as text file
    const downloadAsText = () => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/cover-letters")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0"
                    />
                    {targetCompany && (
                        <span className="text-sm text-muted-foreground">
                            — Targeting: {targetCompany}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Save indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : isSaved ? (
                            <>
                                <Check className="w-3 h-3 text-green-500" />
                                <span className="text-green-500">Saved</span>
                            </>
                        ) : (
                            <>
                                <Cloud className="w-3 h-3" />
                                <span>Auto-save</span>
                            </>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        disabled={!content}
                    >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? "Copied!" : "Copy"}
                    </Button>

                    <Button
                        size="sm"
                        onClick={downloadAsText}
                        disabled={!content}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left panel - Job Description */}
                <div className="w-1/3 border-r p-4 overflow-y-auto bg-muted/30">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Selected Resume</h3>
                            {resumeData ? (
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="font-medium">{resumeData.personalInfo.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{resumeData.name}</p>
                                </div>
                            ) : (
                                <div className="p-3 rounded-lg bg-muted text-center">
                                    <p className="text-sm text-muted-foreground">No resume selected</p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => router.push("/dashboard/cover-letters")}
                                    >
                                        Select a resume
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Target Company</label>
                            <input
                                type="text"
                                value={targetCompany}
                                onChange={(e) => setTargetCompany(e.target.value)}
                                placeholder="e.g., Google, Meta, Startup Inc."
                                className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Target Position</label>
                            <input
                                type="text"
                                value={targetJob}
                                onChange={(e) => setTargetJob(e.target.value)}
                                placeholder="e.g., Senior Software Engineer"
                                className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Job Description</label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Paste the full job description to generate a tailored cover letter
                            </p>
                            <Textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="min-h-[300px] text-sm"
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={generateCoverLetter}
                            disabled={isGenerating || !resumeData || !jobDescription.trim()}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Cover Letter
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right panel - Cover Letter Preview/Editor */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-8 min-h-[600px]">
                            {content ? (
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full min-h-[500px] border-none resize-none focus:ring-0 text-base leading-relaxed"
                                    style={{ fontFamily: "Georgia, serif" }}
                                    placeholder="Your cover letter will appear here..."
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[500px] text-center text-muted-foreground">
                                    <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                                    <p className="max-w-sm">
                                        {resumeData
                                            ? "Paste the job description and click 'Generate Cover Letter' to create a tailored letter."
                                            : "Select a resume from the Cover Letters page to get started."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
