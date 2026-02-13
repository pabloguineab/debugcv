"use client";


import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { Application } from "@/types/application";
import type { SavedResume } from "@/lib/actions/resumes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Flame, Target, TrendingUp, Calendar, Bot, FileText, Mail, ArrowRight, Clock, Briefcase, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLineChart, DashboardRadarChart, DashboardRadialChart } from "./components/dashboard-charts";
import { Link } from "@/i18n/routing";
import { CompanyLogo } from "@/components/company-logo";
import { useProfileCompletion } from "@/contexts/profile-completion-context";
import { getResumes } from "@/lib/actions/resumes";
import { getCoverLetters } from "@/lib/actions/cover-letters";
import { getApplications } from "@/lib/actions/applications";
import { DashboardOnboarding } from "./components/dashboard-onboarding";


// Helper to calculate time ago
function timeAgo(dateString?: string) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

// Calculate resume completeness
function calculateResumeCompleteness(resume: SavedResume): number {
    const data = resume.data;
    if (!data) return 0;

    let score = 0;

    // Basic Info: 10
    if (data.personalInfo?.fullName && data.personalInfo?.email) score += 10;

    // Summary: 15
    if (data.summary && data.summary.length > 30) score += 15;

    // Experience: 30 (15 for first, 15 for more)
    if (data.experience && data.experience.length > 0) {
        score += 15;
        if (data.experience.length > 1 || (data.experience[0]?.bullets?.length || 0) > 2) score += 15;
    }

    // Education: 15
    if (data.education && data.education.length > 0) score += 15;

    // Skills: 15 (needs at least 3)
    if (data.skills && data.skills.length >= 3) score += 15;

    // Projects/Certs: 15
    if ((data.projects && data.projects.length > 0) || (data.certifications && data.certifications.length > 0)) score += 15;

    return Math.min(score, 100);
}


// Get the next upcoming interview

function getActionButton(app: Application) {
    if (app.status === "interview") {
        return (
            <Link href="/dashboard/interview-coach">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30">
                    <Bot className="w-3 h-3" />
                    Prep with AI
                </Button>
            </Link>
        );
    }
    if (app.status === "offer") {
        return (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30">
                <Briefcase className="w-3 h-3" />
                Review Offer
            </Button>
        );
    }
    // Simple logic: if updated more than 7 days ago and no response, suggest follow up
    const lastUpdate = new Date(app.date); // or updated_at
    const daysSinceUpdate = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);

    if (daysSinceUpdate > 7 && app.status === 'applied') {
        return (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/30">
                <Mail className="w-3 h-3" />
                Follow Up
            </Button>
        );
    }
    return (
        <Link href={`/dashboard/application-board?id=${app.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <FileText className="w-3 h-3" />
                View Details
            </Button>
        </Link>
    );
}

function getStageConfig(stage: string) {
    switch (stage) {
        case "interview":
            return { label: "Interview", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800" };
        case "offer":
            return { label: "Offer", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800" };
        case "rejected":
            return { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800" };
        case "wishlist":
            return { label: "Wishlist", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" };
        default:
            return { label: "Applied", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" };
    }
}

function getScoreColor(score: number) {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const { status: profileStatus, isLoading: isProfileLoading } = useProfileCompletion();
    const [hasResumes, setHasResumes] = useState(false);
    const [hasCoverLetters, setHasCoverLetters] = useState(false);
    const [hasApplications, setHasApplications] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [resumesList, setResumesList] = useState<SavedResume[]>([]);
    const [isCheckingData, setIsCheckingData] = useState(true);

    useEffect(() => {
        const checkData = async () => {
            try {
                const [resumes, coverLetters, apps] = await Promise.all([
                    getResumes(),
                    getCoverLetters(),
                    getApplications()
                ]);
                setHasResumes(resumes && resumes.length > 0);
                setHasCoverLetters(coverLetters && coverLetters.length > 0);
                setHasApplications(apps && apps.length > 0);
                setApplications(apps || []);
                setResumesList(resumes || []);
            } catch (error) {
                console.error("Error checking user data:", error);
            } finally {
                setIsCheckingData(false);
            }
        };

        checkData();
    }, []);

    const upcomingInterview = useMemo(() => {
        // Find next interview based on date
        return applications
            .filter(app => app.status === 'interview')
            .sort((a, b) => {
                const dateA = new Date(a.interviewDate || a.date).getTime();
                const dateB = new Date(b.interviewDate || b.date).getTime();
                return dateA - dateB;
            })[0];
    }, [applications]);

    const stats = useMemo(() => {
        // Exclude wishlist from "sent" applications
        const actualApplications = applications.filter(a => a.status !== 'wishlist');
        const total = actualApplications.length;

        // Active = applied, interview, offer (everything except rejected from the actual sent ones)
        const active = actualApplications.filter(a => a.status !== 'rejected').length;

        const interviews = actualApplications.filter(a => ['interview', 'offer'].includes(a.status)).length;
        const interviewRate = total > 0 ? ((interviews / total) * 100).toFixed(1) : "0";

        let totalScore = 0;
        let scoredApps = 0;
        applications.forEach(app => {
            if (app.matchAnalysis?.score) {
                totalScore += app.matchAnalysis.score;
                scoredApps++;
            }
        });
        const matchScore = scoredApps > 0 ? Math.round(totalScore / scoredApps) : 0;

        // Calculate Resume Score (based on completeness)
        // Calculate Resume Score (based on saved ATS score or completeness fallback)
        let totalResumeScore = 0;
        resumesList.forEach(r => {
            // Prioritize the actual AI/ATS score if saved
            if (r.data && r.data.atsScore) {
                totalResumeScore += r.data.atsScore;
            } else {
                // Fallback to completeness heuristic
                totalResumeScore += calculateResumeCompleteness(r);
            }
        });
        const avgResumeScore = resumesList.length > 0 ? Math.round(totalResumeScore / resumesList.length) : 0;

        return { total, active, interviewRate, matchScore, avgResumeScore };
    }, [applications, resumesList]);

    const isLoading = isProfileLoading || isCheckingData;
    const profileProgress = profileStatus?.totalProgress || 0;

    // Determine if onboarding should be shown
    // Show onboarding if profile is not complete OR no resume OR no cover letter
    // You can adjust the threshold for profile completion as needed
    const showOnboarding = !isLoading && (profileProgress < 80 || !hasResumes || !hasCoverLetters || !hasApplications);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (showOnboarding) {
        const userName = session?.user?.name?.split(" ")[0] || "Friend";
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <DashboardOnboarding
                    profileProgress={profileProgress}
                    hasResumes={hasResumes}
                    hasCoverLetters={hasCoverLetters}
                    hasApplications={hasApplications}
                    userName={userName}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Upcoming Interview Alert Banner */}
            {upcomingInterview && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40 border-purple-200 dark:border-purple-800 overflow-hidden">
                    <CardContent className="px-8 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Next Interview</span>
                                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800 text-[10px]">
                                            <Clock className="w-2.5 h-2.5 mr-1" />
                                            Tomorrow
                                        </Badge>
                                    </div>
                                    <p className="font-bold text-base">
                                        {upcomingInterview.title} @ {upcomingInterview.company}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {upcomingInterview.interviewDate ? new Date(upcomingInterview.interviewDate).toLocaleDateString() : 'Scheduled'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Link href="/dashboard/playbooks">
                                    <Button size="sm" variant="outline" className="rounded-r-none border-r-0 gap-1.5 h-7 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30">
                                        <FileText className="w-3 h-3" />
                                        Playbook
                                    </Button>
                                </Link>
                                <Link href="/dashboard/interview-coach">
                                    <Button size="sm" variant="outline" className="rounded-l-none gap-1.5 h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30">
                                        <Bot className="w-3 h-3" />
                                        Practice
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* Applications Sent */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
                        <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pb-1.5 px-3 pt-0">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Target: 50
                        </p>
                    </CardContent>
                </Card>

                {/* Active Processes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
                        <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pb-1.5 px-3 pt-0">
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">
                            Ongoing
                        </p>
                    </CardContent>
                </Card>

                {/* Avg. ATS Score */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
                        <CardTitle className="text-sm font-medium">Avg. ATS Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pb-1.5 px-3 pt-0">
                        <div className="text-2xl font-bold">{stats.avgResumeScore}<span className="text-lg text-muted-foreground">/100</span></div>
                        <p className="text-xs text-muted-foreground">
                            Goal: 85+
                        </p>
                    </CardContent>
                </Card>

                {/* Interview Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
                        <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pb-1.5 px-3 pt-0">
                        <div className="text-2xl font-bold">{stats.interviewRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Conversion
                        </p>
                    </CardContent>
                </Card>
            </div>
            {/* Charts Section - 3 Charts Horizontal */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DashboardRadarChart />
                <DashboardRadialChart score={stats.avgResumeScore} />
                <DashboardLineChart />
            </div>

            {/* Recent Activity & Next Steps Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            Recent Activity & Next Steps
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Your active job applications and recommended actions</p>
                    </div>
                    <Link href="/dashboard/application-board">
                        <Button variant="outline" size="sm" className="gap-2">
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company / Role</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead className="text-center">ATS Score</TableHead>
                                <TableHead>Last Action</TableHead>
                                <TableHead className="text-right">Next Step</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.slice(0, 5).map((app) => {
                                const stageConfig = getStageConfig(app.status);
                                const score = app.matchAnalysis?.score || 0;
                                return (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <CompanyLogo company={app.company} logo={app.logo || ''} size="sm" />
                                                <div>
                                                    <p className="font-medium">{app.title}</p>
                                                    <p className="text-xs text-muted-foreground">@ {app.company}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={stageConfig.className}>
                                                {stageConfig.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`font-bold ${getScoreColor(score)}`}>
                                                {score > 0 ? `${score}%` : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{app.status === 'interview' ? 'Interview' : 'Updated'}</p>
                                                <p className="text-xs text-muted-foreground">{timeAgo(app.date)}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {getActionButton(app)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card >
        </div >
    );
}
