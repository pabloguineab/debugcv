"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, UserCircle, FileText, Mail, Sparkles, type LucideIcon } from "lucide-react";
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
}

export function DashboardOnboarding({ profileProgress, hasResumes, hasCoverLetters }: DashboardOnboardingProps) {
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
    ];

    // Calculate overall onboarding progress
    // We treat profile (0-100) as 33%, resume as 33%, cover letter as 33% roughly
    // Or just count completed steps
    const completedStepsCount = steps.filter(s => s.isCompleted).length;
    const totalSteps = steps.length;
    const overallProgress = (completedStepsCount / totalSteps) * 100;

    // Find current active step
    const currentStepIndex = steps.findIndex(s => s.isCurrent);
    const activeStep = steps[currentStepIndex] || (completedStepsCount === totalSteps ? null : steps[0]);

    if (completedStepsCount === totalSteps) {
        return null; // Should not render if all done (parent handles this, but safety check)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Header */}
            <div className="flex flex-col gap-2 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome to DebugCV! 🚀</h1>
                <p className="text-muted-foreground text-lg">
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
            <div className="grid gap-4 md:grid-cols-3">
                {steps.map((step, index) => {
                    const isActive = step.isCurrent;
                    const isDone = step.isCompleted;
                    const isLocked = !isActive && !isDone;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 ${isActive
                                ? "border-blue-500 shadow-md ring-1 ring-blue-500 bg-white dark:bg-slate-900"
                                : isDone
                                    ? "bg-slate-50 dark:bg-slate-900/50 opacity-80"
                                    : "opacity-60 bg-slate-50/50 dark:bg-slate-900/30"
                                }`}>
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
                                    <CardDescription className="mb-4">
                                        {step.description}
                                    </CardDescription>

                                    <div className="mt-auto">
                                        {isDone ? (
                                            <div className="flex items-center text-green-600 font-medium text-sm bg-green-50 p-2 rounded-md w-fit">
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Completed
                                            </div>
                                        ) : isActive ? (
                                            <Link href={step.href} className="w-full">
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm group">
                                                    {step.cta}
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
                                                Locked
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}


            </div>
            {/* Quick Actions for Completed Tasks */}
            {completedStepsCount > 0 && completedStepsCount < 3 && (
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
