"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, UserCircle, FileText, Mail, Sparkles, type LucideIcon, Search, Layout, Target, PieChart, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    const isProfileComplete = profileProgress >= 80;

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
            isCompleted: hasApplications,
            isCurrent: isProfileComplete && hasResumes && hasCoverLetters && !hasApplications,
            cta: "Search Jobs",
        },
        {
            id: "application-board",
            title: "Track Applications",
            description: "Organize your job hunt with our Kanban board.",
            icon: Layout,
            href: "/dashboard/application-board",
            isCompleted: hasApplications,
            isCurrent: false,
            cta: "View Board",
        },
    ];

    const completedStepsCount = steps.filter(s => s.isCompleted).length;
    const totalSteps = steps.length;
    const overallProgress = (completedStepsCount / totalSteps) * 100;

    if (completedStepsCount === totalSteps) {
        return null;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header with Progress */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-6 relative overflow-hidden">
                <div className="z-10">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2"
                    >
                        Welcome, {userName} <motion.span animate={{ rotate: [0, 15, -10, 10, 0] }} transition={{ delay: 1, duration: 1.5 }}>👋</motion.span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-muted-foreground mt-1"
                    >
                        Let's set up your workspace. Complete these steps to activate your dashboard.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-end gap-2 min-w-[200px] z-10"
                >
                    <div className="flex justify-between w-full text-xs font-medium text-muted-foreground mb-1">
                        <span>Setup Progress</span>
                        <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden relative">
                        <motion.div
                            className="h-full bg-primary relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Background decorative blob */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Checklist Grid */}
            <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {steps.map((step) => {
                    const isActive = step.isCurrent;
                    const isCompleted = step.isCompleted;

                    return (
                        <motion.div
                            key={step.id}
                            variants={itemVariants}
                            whileHover={isActive ? { scale: 1.02, y: -2 } : { scale: 1.01 }}
                            className="h-full"
                        >
                            <Link href={step.href} className={cn("block h-full outline-none", !isActive && !isCompleted && "pointer-events-none")}>
                                <Card className={cn(
                                    "relative flex flex-col h-full transition-all duration-300 group overflow-hidden border",
                                    isActive
                                        ? "border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20 bg-background"
                                        : "border-border bg-card/40 hover:bg-card/80",
                                    isCompleted && "bg-muted/10 border-border/60",
                                    !isActive && !isCompleted && "opacity-60 grayscale-[0.2]"
                                )}>
                                    {isActive && (
                                        <motion.div
                                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}

                                    <div className="p-4 flex flex-col h-full gap-3 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className={cn(
                                                "p-2 rounded-lg transition-colors border shadow-sm",
                                                isActive ? "bg-primary text-primary-foreground border-primary" :
                                                    isCompleted ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800" :
                                                        "bg-muted text-muted-foreground border-border"
                                            )}>
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            {isCompleted ? (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                                                </motion.div>
                                            ) : !isActive ? (
                                                <Lock className="w-4 h-4 text-muted-foreground/40" />
                                            ) : null}
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
                                                <Button size="sm" className="w-full text-xs h-8 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm group-hover:shadow-md transition-all">
                                                    {step.cta} <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            ) : isCompleted ? (
                                                <div className="h-8 flex items-center text-[10px] uppercase tracking-wider font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-3 rounded-sm w-fit">
                                                    Completed
                                                </div>
                                            ) : (
                                                <div className="h-8 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground opacity-50">
                                                    Locked
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Premium Features - Enhanced */}
            <motion.div
                className="pt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-full bg-primary/10">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground">Unlock Premium Tools</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { title: "AI Job Coach", desc: "Personalized career advice and resume critiques powered by advanced AI algorithms.", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/10" },
                        { title: "Smart Matching", desc: "Automatically tailor your resume keywords to job descriptions for higher ATS scores.", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { title: "Analytics", desc: "Track your application velocity and conversion rates with detailed charts.", icon: PieChart, color: "text-purple-500", bg: "bg-purple-500/10" }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                            className="p-5 rounded-xl border border-border/50 bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm cursor-default"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("p-2 rounded-lg", feature.bg, feature.color)}>
                                    <feature.icon className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-sm">{feature.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
