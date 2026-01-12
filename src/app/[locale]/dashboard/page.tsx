"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Flame, Target, TrendingUp, Calendar, Bot, FileText, Mail, ArrowRight, Clock, Briefcase } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLineChart, DashboardRadarChart, DashboardRadialChart } from "./components/dashboard-charts";
import { Link } from "@/i18n/routing";
import { CompanyLogo } from "@/components/company-logo";

// Mock data for recent applications
const recentApplications = [
    {
        id: "1",
        company: "Spotify",
        role: "Frontend Developer",
        logo: "https://logo.clearbit.com/spotify.com",
        stage: "interview",
        atsScore: 92,
        lastAction: "Interview scheduled",
        lastActionDate: "Tomorrow, 10:00 AM",
        isUrgent: true,
    },
    {
        id: "2",
        company: "Stripe",
        role: "Full Stack Engineer",
        logo: "https://logo.clearbit.com/stripe.com",
        stage: "applied",
        atsScore: 88,
        lastAction: "CV sent",
        lastActionDate: "2 days ago",
        isUrgent: false,
    },
    {
        id: "3",
        company: "Figma",
        role: "React Developer",
        logo: "https://logo.clearbit.com/figma.com",
        stage: "applied",
        atsScore: 76,
        lastAction: "Applied",
        lastActionDate: "5 days ago",
        isUrgent: false,
    },
    {
        id: "4",
        company: "Linear",
        role: "Software Engineer",
        logo: "https://logo.clearbit.com/linear.app",
        stage: "offer",
        atsScore: 94,
        lastAction: "Offer received",
        lastActionDate: "1 day ago",
        isUrgent: true,
    },
    {
        id: "5",
        company: "Notion",
        role: "Backend Developer",
        logo: "https://logo.clearbit.com/notion.so",
        stage: "applied",
        atsScore: 65,
        lastAction: "No response",
        lastActionDate: "12 days ago",
        isUrgent: false,
    },
];

// Get the next upcoming interview
const upcomingInterview = recentApplications.find(app => app.stage === "interview" && app.isUrgent);

function getStageConfig(stage: string) {
    switch (stage) {
        case "interview":
            return { label: "Interview", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800" };
        case "offer":
            return { label: "Offer", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800" };
        case "rejected":
            return { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800" };
        default:
            return { label: "Applied", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" };
    }
}

function getScoreColor(score: number) {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
}

function getActionButton(app: typeof recentApplications[0]) {
    if (app.stage === "interview") {
        return (
            <Link href="/dashboard/interview-coach">
                <Button size="sm" className="gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs h-7">
                    <Bot className="w-3 h-3" />
                    Prep with AI
                </Button>
            </Link>
        );
    }
    if (app.stage === "offer") {
        return (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30">
                <Briefcase className="w-3 h-3" />
                Review Offer
            </Button>
        );
    }
    if (app.lastActionDate.includes("days ago")) {
        const daysAgo = parseInt(app.lastActionDate);
        if (daysAgo >= 7 || app.lastActionDate.includes("12")) {
            return (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/30">
                    <Mail className="w-3 h-3" />
                    Follow Up
                </Button>
            );
        }
    }
    return (
        <Link href="/dashboard/resumes">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <FileText className="w-3 h-3" />
                View CV
            </Button>
        </Link>
    );
}

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            {/* Upcoming Interview Alert Banner */}
            {upcomingInterview && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40 border-purple-200 dark:border-purple-800 overflow-hidden">
                    <CardContent className="px-5 py-3">
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
                                        {upcomingInterview.role} @ {upcomingInterview.company}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{upcomingInterview.lastActionDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Link href="/dashboard/playbooks">
                                    <Button size="sm" variant="outline" className="rounded-r-none border-r-0 gap-1.5">
                                        <FileText className="w-3.5 h-3.5" />
                                        Playbook
                                    </Button>
                                </Link>
                                <Link href="/dashboard/interview-coach">
                                    <Button size="sm" variant="outline" className="rounded-l-none gap-1.5">
                                        <Bot className="w-3.5 h-3.5" />
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+5</span> this week
                        </p>
                    </CardContent>
                </Card>

                {/* Active Processes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">
                            3 waiting for reply
                        </p>
                    </CardContent>
                </Card>

                {/* Avg. ATS Score */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. ATS Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">85<span className="text-lg text-muted-foreground">/100</span></div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+12%</span> vs last month
                        </p>
                    </CardContent>
                </Card>

                {/* Interview Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">14.5%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">Top 10%</span> market avg
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section - 3 Charts Horizontal */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DashboardRadarChart />
                <DashboardRadialChart />
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
                            {recentApplications.map((app) => {
                                const stageConfig = getStageConfig(app.stage);
                                return (
                                    <TableRow key={app.id} className={app.isUrgent ? "bg-purple-50/50 dark:bg-purple-950/20" : ""}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <CompanyLogo company={app.company} logo={app.logo} size="sm" />
                                                <div>
                                                    <p className="font-medium">{app.role}</p>
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
                                            <span className={`font-bold ${getScoreColor(app.atsScore)}`}>
                                                {app.atsScore}%
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{app.lastAction}</p>
                                                <p className="text-xs text-muted-foreground">{app.lastActionDate}</p>
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
            </Card>
        </div>
    );
}
