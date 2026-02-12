"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, UserCircle, FileText, Mail, Sparkles, type LucideIcon, Search, Layout, Target, PieChart } from "lucide-react";
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

    if (completedStepsCount === totalSteps) {
        return null;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Progress - Minimalist */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome, {userName}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Let's set up your workspace. Complete these steps to activate your dashboard.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[200px]">
                    <div className="flex justify-between w-full text-xs font-medium text-muted-foreground mb-1">
                        <span>Setup Progress</span>
                        <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>

            {/* Checklist Grid - Minimalist */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {steps.map((step, index) => {
                    const isActive = step.isCurrent;
                    const isCompleted = step.isCompleted;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="h-full"
                        >
                            <Link href={step.href} className={cn("block h-full outline-none", !isActive && !isCompleted && "pointer-events-none")}>
                                <Card className={cn(
                                    "relative flex flex-col h-full transition-all duration-200 group hover:shadow-md",
                                    isActive
                                        ? "border-primary/50 shadow-sm ring-1 ring-primary/5 bg-background"
                                        : "border-border bg-card/50",
                                    isCompleted && "bg-muted/10 border-border/60",
                                    !isActive && !isCompleted && "opacity-60 grayscale-[0.2]"
                                )}>
                                    <div className="p-4 flex flex-col h-full gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className={cn(
                                                "p-2 rounded-md transition-colors border",
                                                isActive ? "bg-primary/5 text-primary border-primary/10" :
                                                    isCompleted ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/10" :
                                                        "bg-muted/50 text-muted-foreground border-border/50"
                                            )}>
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            {isCompleted && (
                                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                                            )}
                                        </div>

                                        <div className="space-y-1.5 mb-2">
                                            <h3 className={cn("font-medium text-sm tracking-tight", isCompleted && "text-muted-foreground")}>
                                                {step.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                {step.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-2">
                                            {isActive ? (
                                                <Button size="sm" className="w-full text-xs h-7 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                                                    {step.cta}
                                                </Button>
                                            ) : isCompleted ? (
                                                <div className="h-7 flex items-center text-[10px] uppercase tracking-wider font-semibold text-green-600 dark:text-green-500">
                                                    Completed
                                                </div>
                                            ) : (
                                                <div className="h-7 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground opacity-50 space-x-1">
                                                    <span>Locked</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer - Minimalist */}
            {/* Value Proposition / Upcoming Features */}
            <div className="pt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium text-muted-foreground">Unlock Premium Features</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm">AI Job Coach</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Personalized career advice and resume critiques powered by advanced AI algorithms.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Target className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm">Smart Matching</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Automatically tailor your resume keywords to job descriptions for higher ATS scores.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <PieChart className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm">Analytics</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Track your application velocity and conversion rates with detailed charts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
