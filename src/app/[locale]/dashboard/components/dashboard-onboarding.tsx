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
}

export function DashboardOnboarding({ profileProgress, hasResumes, hasCoverLetters, hasApplications }: DashboardOnboardingProps) {
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
        <div className="flex flex-col gap-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Welcome to DebugCV! 🚀</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Let's get you set up to land your dream job. Follow these steps to unlock the full power of the dashboard.
                </p>
            </div>

            {/* Main Progress Card */}
            <Card className="border-blue-100 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Setup Progress</span>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                </CardContent>
            </Card>

            {/* Steps Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {steps.map((step, index) => {
                    const isActive = step.isCurrent;
                    const isDone = step.isCompleted;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={cn(
                                "h-full flex flex-col relative overflow-hidden transition-all duration-300",
                                isActive ? "border-blue-500 shadow-md ring-1 ring-blue-500 bg-white dark:bg-slate-900"
                                    : isDone ? "bg-slate-50 dark:bg-slate-900/50 opacity-80"
                                        : "opacity-60 bg-slate-50/50 dark:bg-slate-900/30"
                            )}>
                                {isActive && (
                                    <div className="absolute top-0 right-0 p-3">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                        </span>
                                    </div>
                                )}

                                <CardHeader className="pb-2">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                                        isDone ? "bg-green-100 text-green-600" : isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className={cn(
                                        "text-lg",
                                        isDone && "text-green-700",
                                        isActive && "text-blue-700"
                                    )}>
                                        {step.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                                    <CardDescription className="mb-4 text-xs">
                                        {step.description}
                                    </CardDescription>

                                    <div className="mt-auto">
                                        {isDone ? (
                                            <div className="flex items-center text-green-600 font-medium text-xs bg-green-50 p-2 rounded-md w-fit">
                                                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                                Done
                                            </div>
                                        ) : isActive ? (
                                            <Link href={step.href} className="w-full">
                                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm group text-xs">
                                                    {step.cta}
                                                    <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                <Circle className="w-3 h-3" /> Locked
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
            {/* Tip/Footer */}
            {completedStepsCount > 0 && completedStepsCount < 5 && (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Tip: Completing the onboarding unlocks your personalized AI Job Coach and Analytics Dashboard.
                    </p>
                </div>
            )}
        </div>
    );
}
