"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface NewResumeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type Step = "choice" | "job-details";

export function NewResumeDialog({ open, onOpenChange }: NewResumeDialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState<Step>("choice");
    const [tailorToJob, setTailorToJob] = useState(true);
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    // Reset state when opening/closing
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep("choice");
                setTailorToJob(true);
                setJobTitle("");
                setJobDescription("");
            }, 300);
        }
    }, [open]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onOpenChange(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onOpenChange]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onOpenChange(false);
        }
    };

    const handleQuickPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setJobDescription(text);
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    const handleNext = () => {
        if (tailorToJob) {
            setStep("job-details");
        } else {
            // Create resume without job details - navigate to builder
            handleCreateResume();
        }
    };

    const handleBack = () => {
        setStep("choice");
    };

    const handleCreateResume = () => {
        // TODO: Implement resume creation logic
        console.log("Creating resume with:", { tailorToJob, jobTitle, jobDescription });
        onOpenChange(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                    onClick={handleOverlayClick}
                >
                    <AnimatePresence mode="wait">
                        {step === "choice" && (
                            <motion.div
                                key="choice"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-lg bg-background rounded-xl shadow-2xl border relative flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-10"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Button>

                                <div className="flex flex-col space-y-1.5 p-6 pb-4">
                                    <h3 className="font-semibold leading-none tracking-tight text-xl">Create new resume</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Would you like to tailor this resume to a specific job?
                                    </p>
                                </div>

                                <div className="px-6 pb-4">
                                    <div
                                        onClick={() => setTailorToJob(!tailorToJob)}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                            tailorToJob
                                                ? "border-primary bg-primary/5"
                                                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                                            tailorToJob
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-gray-300 dark:border-gray-600"
                                        )}>
                                            {tailorToJob && <Check className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tailor to a specific job</h4>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                Optimize your resume for a particular position by providing job details
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-3 p-6 pt-4 border-t">
                                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleNext}>
                                        {tailorToJob ? "Next" : "Create Resume"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === "job-details" && (
                            <motion.div
                                key="job-details"
                                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-4xl bg-background rounded-xl shadow-2xl border relative flex flex-col max-h-[90vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-10"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Button>

                                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                                    <h3 className="font-semibold leading-none tracking-tight text-xl">Create New Resume</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Start by providing the job details you are targeting.
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-4">
                                    <div className="grid md:grid-cols-2 gap-6 h-full">
                                        {/* Left Column: Quick Paste */}
                                        <Card className="border-dashed overflow-hidden flex flex-col h-full shadow-sm">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">Quick Paste</CardTitle>
                                                <CardDescription className="text-xs">
                                                    Copy the job offer from LinkedIn, Indeed, etc.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0 pb-4 px-4 flex-1">
                                                {/* Animated Browser Widget */}
                                                <div
                                                    onClick={handleQuickPaste}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-md relative h-64 cursor-pointer group hover:border-primary/50 transition-colors"
                                                >
                                                    {/* Browser header */}
                                                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                                                        <div className="flex gap-1.5">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                                        </div>
                                                        <div className="flex-1 bg-white dark:bg-gray-700 rounded px-2 py-1 text-[10px] text-gray-400 dark:text-gray-500 truncate flex items-center">
                                                            <span className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded-full mr-1"></span>
                                                            linkedin.com/jobs/view/38291...
                                                        </div>
                                                    </div>

                                                    {/* Animation Container */}
                                                    <div className="relative h-52 overflow-hidden bg-white dark:bg-gray-900">
                                                        {/* Scrolling Content */}
                                                        <motion.div
                                                            className="p-4 text-xs text-gray-600 dark:text-gray-300"
                                                            animate={{ y: [0, -100, -100, 0] }}
                                                            transition={{
                                                                duration: 8,
                                                                times: [0, 0.4, 0.9, 1],
                                                                repeat: Infinity,
                                                                repeatDelay: 1,
                                                                ease: "easeInOut"
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-3 mb-4">
                                                                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">In</div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Senior Software Engineer</h3>
                                                                    <p className="text-gray-500 dark:text-gray-400 text-[10px]">TechStart Inc • Madrid (Hybrid)</p>
                                                                    <div className="flex gap-1 mt-1">
                                                                        <span className="text-[9px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">Actively hiring</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3 relative z-0">
                                                                <p className="text-[11px] leading-relaxed">
                                                                    We are looking for a <span className="font-semibold text-gray-800 dark:text-gray-200">Senior Frontend Engineer</span> to join our core product team. You will be responsible for building high-performance web applications using modern technologies.
                                                                </p>

                                                                <div>
                                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mb-1">Requirements:</h4>
                                                                    <ul className="space-y-1 text-[10px] list-disc pl-4">
                                                                        <li>5+ years of experience with <span className="font-semibold">React, TypeScript</span> and Node.js.</li>
                                                                        <li>Experience with Next.js and state management tools.</li>
                                                                        <li>Strong understanding of web performance and SEO.</li>
                                                                        <li>Experience in CI/CD pipelines and testing (Jest, Cypress).</li>
                                                                        <li>Excellent problem-solving skills and mentorship ability.</li>
                                                                    </ul>
                                                                </div>

                                                                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700/50">
                                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mb-1">Benefits:</h4>
                                                                    <ul className="space-y-1 text-[10px] list-disc pl-4">
                                                                        <li>Competitive salary (€60k - €90k).</li>
                                                                        <li>Remote-first culture with flexible hours.</li>
                                                                        <li>Health insurance and gym membership.</li>
                                                                        <li>Stock options and annual bonus.</li>
                                                                        <li>Annual retreat to tropical locations.</li>
                                                                    </ul>
                                                                </div>

                                                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mb-1">About the Team</h4>
                                                                    <p className="text-[10px]">We are a diverse team of engineering enthusiasts who love open source and clean code.</p>
                                                                </div>
                                                            </div>

                                                            {/* Selection Overlay */}
                                                            <motion.div
                                                                className="absolute top-[80px] left-[16px] right-[16px] bg-primary/20 mix-blend-normal pointer-events-none z-10 rounded-sm"
                                                                animate={{
                                                                    height: [0, 200, 200, 0]
                                                                }}
                                                                transition={{
                                                                    duration: 8,
                                                                    times: [0, 0.4, 0.9, 1],
                                                                    repeat: Infinity,
                                                                    repeatDelay: 1,
                                                                    ease: "easeInOut"
                                                                }}
                                                            />
                                                        </motion.div>

                                                        {/* Cursor Animation */}
                                                        <motion.div
                                                            className="absolute z-50 pointer-events-none"
                                                            animate={{
                                                                top: ["80px", "180px", "180px", "150px", "150px", "80px"],
                                                                left: ["16px", "200px", "200px", "150px", "150px", "16px"],
                                                                scale: [1, 1, 1, 1, 0.8, 1]
                                                            }}
                                                            transition={{
                                                                duration: 8,
                                                                times: [0, 0.4, 0.5, 0.6, 0.65, 1],
                                                                repeat: Infinity,
                                                                repeatDelay: 1,
                                                                ease: "easeInOut"
                                                            }}
                                                        >
                                                            <svg className="w-5 h-5 text-black dark:text-white fill-current drop-shadow-md" viewBox="0 0 24 24" fill="none">
                                                                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="currentColor" stroke="white" strokeWidth="1" className="dark:stroke-gray-900" />
                                                            </svg>
                                                        </motion.div>

                                                        {/* Context Menu */}
                                                        <motion.div
                                                            className="absolute top-[120px] left-[120px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-[11px] z-40 w-28 origin-top-left"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{
                                                                opacity: [0, 0, 1, 1, 0, 0],
                                                                scale: [0.8, 0.8, 1, 1, 0.8, 0.8]
                                                            }}
                                                            transition={{
                                                                duration: 8,
                                                                times: [0, 0.45, 0.5, 0.8, 0.9, 1],
                                                                repeat: Infinity,
                                                                repeatDelay: 1
                                                            }}
                                                        >
                                                            <div className="px-3 py-1.5 text-gray-500 dark:text-gray-400">Search Google</div>
                                                            <motion.div
                                                                className="px-3 py-1.5 bg-primary text-primary-foreground font-medium flex justify-between items-center"
                                                                animate={{ scale: [1, 1, 0.95, 1, 1] }}
                                                                transition={{
                                                                    duration: 8,
                                                                    times: [0, 0.6, 0.65, 0.7, 1],
                                                                    repeat: Infinity,
                                                                    repeatDelay: 1
                                                                }}
                                                            >
                                                                Copy <span>⌘C</span>
                                                            </motion.div>
                                                            <div className="px-3 py-1.5 text-gray-500 dark:text-gray-400">Share...</div>
                                                        </motion.div>
                                                    </div>

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors z-50 flex items-center justify-center pointer-events-none">
                                                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-full px-4 py-2 font-medium text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
                                                            <span className="text-lg">📋</span> Click to Paste
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Right Column: Job Details */}
                                        <Card className="flex flex-col h-full shadow-sm">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">Job Details</CardTitle>
                                                <CardDescription className="text-xs">
                                                    Enter the job title and description manually
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3 flex-1 flex flex-col">
                                                <div className="space-y-2">
                                                    <Label htmlFor="job-title" className="text-xs font-medium">
                                                        Job Title
                                                    </Label>
                                                    <Input
                                                        id="job-title"
                                                        type="text"
                                                        value={jobTitle}
                                                        onChange={(e) => setJobTitle(e.target.value)}
                                                        placeholder="e.g. Senior Frontend Developer"
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-2 flex-1 flex flex-col">
                                                    <Label htmlFor="job-description" className="text-xs font-medium">
                                                        Job Description
                                                    </Label>
                                                    <Textarea
                                                        id="job-description"
                                                        value={jobDescription}
                                                        onChange={(e) => setJobDescription(e.target.value)}
                                                        placeholder="Paste or type the job description here..."
                                                        className="resize-none flex-1 text-xs min-h-[150px]"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-2 p-6 pt-2 border-t mt-auto">
                                    <Button variant="outline" onClick={handleBack}>
                                        Back
                                    </Button>
                                    <Button disabled={!jobTitle || !jobDescription} onClick={handleCreateResume}>
                                        Create Resume
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
