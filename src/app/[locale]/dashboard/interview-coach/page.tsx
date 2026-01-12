"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogo } from "@/components/company-logo";
import {
    Zap,
    Calendar,
    MapPin,
    Sparkles,
    TrendingUp,
    Clock,
    Search,
    ArrowRight,
    Target,
    Brain,
    MessageSquare,
    Bot,
} from "lucide-react";
import { Link } from "@/i18n/routing";

interface Application {
    id: string;
    title: string;
    company: string;
    logo?: string;
    location?: string;
    status: string;
    interviewDate?: string;
    notes?: string;
}

export default function AISimulatorPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated") {
            fetchInterviews();
        }
    }, [status, router]);

    const fetchInterviews = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/applications");
            if (response.ok) {
                const data = await response.json();
                // Filter only applications with status "interview"
                // The API returns an array directly
                const apps = Array.isArray(data) ? data : (data.applications || []);
                const interviews = apps.filter(
                    (app: Application) => app.status === "interview"
                );
                setApplications(interviews);
            }
        } catch (error) {
            console.error("Error fetching interviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDaysUntilInterview = (interviewDate?: string) => {
        if (!interviewDate) return null;
        const today = new Date();
        const interview = new Date(interviewDate);
        const diffTime = interview.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getReadinessLevel = (daysUntil: number | null) => {
        if (daysUntil === null) return { level: "No date set", color: "gray", percentage: 0 };
        if (daysUntil < 0) return { level: "Past", color: "red", percentage: 100 };
        if (daysUntil === 0) return { level: "Today!", color: "orange", percentage: 100 };
        if (daysUntil <= 3) return { level: "Urgent", color: "red", percentage: 85 };
        if (daysUntil <= 7) return { level: "Soon", color: "yellow", percentage: 60 };
        return { level: "Time to prepare", color: "green", percentage: 30 };
    };

    const filteredApplications = applications.filter((app) =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Only block on initial auth loading
    if (status === "loading") {
        return (
            <div className="flex-1 p-6">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="max-w-7xl mx-auto w-full space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                            <Bot className="w-6 h-6 text-purple-600" />
                            AI Simulator
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Practice with AI-powered interview simulations
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Active Interviews</p>
                                    <p className="text-xl font-bold">{applications.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Simulations Done</p>
                                    <p className="text-xl font-bold">0</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Readiness Level</p>
                                    <p className="text-xl font-bold">--</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search interviews by company or position..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Interview Cards, Loading Skeleton, or Empty State */}
                {isLoading ? (
                    // Loading skeleton
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Skeleton className="w-12 h-12 rounded-lg" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-48" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-24" />
                                                <Skeleton className="h-6 w-32" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-3">
                                            <Skeleton className="h-10 w-36" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-dashed">
                            <CardContent className="p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {searchQuery ? "No interviews match your search" : "No upcoming interviews"}
                                </h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    {searchQuery
                                        ? "Try adjusting your search terms"
                                        : "When you have interviews scheduled in your Application Board, they'll appear here for practice sessions."}
                                </p>
                                <Link href="/dashboard/application-board">
                                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                        <Target className="w-4 h-4 mr-2" />
                                        Go to Application Board
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map((app, index) => {
                            const daysUntil = getDaysUntilInterview(app.interviewDate);
                            const readiness = getReadinessLevel(daysUntil);

                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="group hover:shadow-lg transition-all duration-300">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                {/* Left: Job Info */}
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start gap-3">
                                                        <CompanyLogo company={app.company} logo={app.logo} size="md" />
                                                        <div>
                                                            <h3 className="text-lg font-bold">{app.title}</h3>
                                                            <p className="text-blue-600 dark:text-blue-400 font-medium">{app.company}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {app.location && (
                                                            <Badge variant="secondary" className="gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {app.location}
                                                            </Badge>
                                                        )}
                                                        {app.interviewDate && (
                                                            <Badge variant="secondary" className="gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(app.interviewDate).toLocaleDateString("en-US", {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                })}
                                                            </Badge>
                                                        )}
                                                        {daysUntil !== null && daysUntil >= 0 && (
                                                            <Badge variant="outline" className="gap-1 border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">
                                                                <Clock className="w-3 h-3" />
                                                                {daysUntil === 0 ? "Today" : `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {app.notes && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{app.notes}</p>
                                                    )}
                                                </div>

                                                {/* Right: CTA */}
                                                <div className="flex flex-col items-center gap-2 md:border-l md:pl-4">
                                                    <div className="text-center">
                                                        <div className={`text-sm font-semibold mb-2 ${readiness.color === "red" ? "text-red-500" :
                                                            readiness.color === "orange" ? "text-orange-500" :
                                                                readiness.color === "yellow" ? "text-yellow-500" :
                                                                    readiness.color === "green" ? "text-green-500" :
                                                                        "text-gray-500"
                                                            }`}>
                                                            {readiness.level}
                                                        </div>
                                                        <div className="w-28 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${readiness.color === "red" ? "bg-red-500" :
                                                                    readiness.color === "orange" ? "bg-orange-500" :
                                                                        readiness.color === "yellow" ? "bg-yellow-500" :
                                                                            readiness.color === "green" ? "bg-green-500" :
                                                                                "bg-gray-400"
                                                                    }`}
                                                                style={{ width: `${readiness.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <Link href={`/dashboard/interview-coach/simulator?jobId=${app.id}`}>
                                                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all">
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Start Simulation
                                                            <ArrowRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </Link>

                                                    <Link href="/dashboard/application-board" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                        View in Application Board
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* AI Feature Hint */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                <Brain className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">AI-Powered Practice</p>
                                <p className="text-xs text-muted-foreground">
                                    Get personalized interview questions based on your resume and job description
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                            Coming Soon
                        </Badge>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
