"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, UserCircle, FileText, Mail, Sparkles, type LucideIcon, Search, Layout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    isCompleted: boolean;
    isCurrent: boolean;
    cta: string;
}

interface DashboardOnboardingProps {
    profileProgress: number;
    hasResumes: boolean;

    hasCoverLetters: boolean;
    hasApplications: boolean;
    userName?: string;
}

export function DashboardOnboarding({ profileProgress, hasResumes, hasCoverLetters, hasApplications, userName = "Friend" }: DashboardOnboardingProps) {
    // Define steps logic
    const isProfileComplete = profileProgress >= 80; // Consider 80% good enough for onboarding styling

    const steps: OnboardingStep[] = [
        {
            id: "profile",
            title: "Complete Your Profile",
            description: "Add your experience, skills, and education to power our AI.",
            icon: UserCircle,
            href: "/dashboard/profile",
            isCompleted: isProfileComplete,
            isCurrent: !isProfileComplete,
            cta: "Go to Profile",
        },
        {
            id: "resume",
            title: "Create Your First Resume",
            description: "Use our builder to create a professional, ATS-optimized resume.",
            icon: FileText,
            href: "/dashboard/resumes",
            isCompleted: hasResumes,
            isCurrent: isProfileComplete && !hasResumes,
            cta: "Create Resume",
        },
        {
            id: "cover-letter",
            title: "Generate a Cover Letter",
            description: "Create a tailored cover letter that matches your resume and target job.",
            icon: Mail,
            href: "/dashboard/cover-letters",
            isCompleted: hasCoverLetters,
            isCurrent: isProfileComplete && hasResumes && !hasCoverLetters,
            cta: "Create Cover Letter",
        },
        {
            id: "job-search",
            title: "Find Opportunities",
            description: "Search for jobs and save them to your board instantly.",
            icon: Search,
            href: "/dashboard/job-search",
            isCompleted: hasApplications, // Completed if at least 1 app exists
            isCurrent: isProfileComplete && hasResumes && hasCoverLetters && !hasApplications,
            cta: "Search Jobs",
        },
        {
            id: "application-board",
            title: "Track Applications",
            description: "Organize your job hunt with our Kanban board.",
            icon: Layout,
            href: "/dashboard/application-board",
            isCompleted: hasApplications, // Initially mark complete if they have apps, or we could require >1
            isCurrent: false, // Never "current" alone in this flow, it unlocks with Job Search
            cta: "View Board",
        },
    ];

    // Calculate overall onboarding progress
    const completedStepsCount = steps.filter(s => s.isCompleted).length;
    const totalSteps = steps.length;
    const overallProgress = (completedStepsCount / totalSteps) * 100;

    // Find current active step
    const currentStepIndex = steps.findIndex(s => s.isCurrent);
    // If no specific step is current but flow is not done, maybe show last logic (handled by isCurrent above)
    // If we are at the "Track Applications" stage (hasApplications is true), then everything is done.

    // Safety: If somehow hasApplications is true but hasCoverLetters is false, earlier steps handle "Current".

    if (completedStepsCount === totalSteps) {
        return null;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Progress */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                        Welcome, {userName}! 👋
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-base">
                        Your journey to your dream job starts here. Complete these steps to unlock AI superpowers.
                    </p>
                </div>

                <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900/50 p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Onboarding Progress</span>
                        <span className="text-sm font-bold text-primary">{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                        />
                    </div>
                </div>
            </div>

            {/* Steps Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
                {steps.map((step, index) => {
                    const isActive = step.isCurrent;
                    const isDone = step.isCompleted;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            className="h-full"
                        >
                            <Link href={step.href} className={cn("block h-full group", !isActive && !isDone && "pointer-events-none")}>
                                <div className={cn(
                                    "h-full flex flex-col relative p-5 rounded-2xl border transition-all duration-300",
                                    isActive
                                        ? "bg-white dark:bg-slate-900 border-blue-500/50 ring-4 ring-blue-500/10 shadow-xl scale-[1.02] z-10"
                                        : isDone
                                            ? "bg-slate-50/50 dark:bg-slate-900/20 border-green-500/20 hover:border-green-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                            : "bg-slate-50/30 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/50 grayscale opacity-70"
                                )}>

                                    {/* Status Indicator */}
                                    <div className="absolute top-4 right-4">
                                        {isDone ? (
                                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        ) : isActive ? (
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                            </span>
                                        ) : (
                                            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-slate-400">
                                                <Circle className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Icon */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                                        isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" :
                                            isDone ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                                                "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                    )}>
                                        <step.icon className="w-6 h-6" />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2 mb-4">
                                        <h3 className={cn(
                                            "font-semibold leading-tight",
                                            isActive ? "text-lg text-slate-900 dark:text-white" :
                                                isDone ? "text-base text-slate-700 dark:text-slate-300" :
                                                    "text-base text-muted-foreground"
                                        )}>
                                            {step.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Action (Pushed to bottom) */}
                                    <div className="mt-auto pt-4">
                                        {isActive ? (
                                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md group-hover:shadow-lg transition-all rounded-lg text-xs">
                                                {step.cta}
                                                <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        ) : (
                                            <div className={cn(
                                                "text-xs font-medium px-3 py-2 rounded-lg text-center border border-dashed transition-colors",
                                                isDone ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400" :
                                                    "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/20"
                                            )}>
                                                {isDone ? "Completed" : "Locked"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Tip */}
            {completedStepsCount > 0 && completedStepsCount < 5 && (
                <div className="flex items-center justify-center">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/30 px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200 shadow-sm animate-pulse">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Pro Tip:</span>
                        <span className="opacity-90">Finish onboarding to activate your AI Job Coach</span>
                    </div>
                </div>
            )}
        </div>
    );
}
