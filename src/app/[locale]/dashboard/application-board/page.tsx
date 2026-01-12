"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import type { Application, ApplicationStatus } from "@/types/application";
import { KanbanBoard } from "@/components/application-board/kanban-board";
import { ListView } from "@/components/application-board/list-view";
import { AddApplicationModal } from "@/components/application-board/add-application-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    LayoutGrid,
    List,
    Briefcase,
    Mail,
    ArrowRight,
} from "lucide-react";

type ViewMode = "kanban" | "list";

// Demo data for preview
const DEMO_APPLICATIONS: Application[] = [
    {
        id: "1",
        userEmail: "demo@example.com",
        title: "Senior Frontend Developer",
        company: "Vercel",
        logo: "https://logo.clearbit.com/vercel.com",
        location: "Remote",
        workMode: "remote",
        expectedSalary: [150, 200],
        priority: "high",
        status: "interview",
        date: new Date().toISOString(),
    },
    {
        id: "2",
        userEmail: "demo@example.com",
        title: "Full Stack Engineer",
        company: "Stripe",
        logo: "https://logo.clearbit.com/stripe.com",
        location: "San Francisco, CA",
        workMode: "hybrid",
        expectedSalary: [180, 220],
        priority: "high",
        status: "applied",
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        id: "3",
        userEmail: "demo@example.com",
        title: "React Developer",
        company: "Figma",
        logo: "https://logo.clearbit.com/figma.com",
        location: "Remote",
        workMode: "remote",
        expectedSalary: [130, 170],
        priority: "medium",
        status: "wishlist",
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
        id: "4",
        userEmail: "demo@example.com",
        title: "Software Engineer",
        company: "Linear",
        logo: "https://logo.clearbit.com/linear.app",
        location: "Remote",
        workMode: "remote",
        expectedSalary: [140, 180],
        priority: "medium",
        status: "offer",
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        matchAnalysis: {
            score: 85,
            missingKeywords: [],
            missingTech: [],
            recommendations: [],
            matchingKeywords: ["React", "TypeScript", "Node.js"],
        },
    },
    {
        id: "5",
        userEmail: "demo@example.com",
        title: "Frontend Engineer",
        company: "Notion",
        logo: "https://logo.clearbit.com/notion.so",
        location: "New York, NY",
        workMode: "hybrid",
        expectedSalary: [160, 200],
        priority: "low",
        status: "applied",
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
];

export default function ApplicationBoardPage() {
    const { data: session, status: authStatus } = useSession();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("kanban");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    useEffect(() => {
        // For now, use demo data
        // In production, fetch from API
        const loadApplications = async () => {
            setIsLoading(true);
            try {
                // Simulating API call
                await new Promise(resolve => setTimeout(resolve, 500));
                setApplications(DEMO_APPLICATIONS);
            } catch (error) {
                console.error("Error loading applications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadApplications();
    }, []);

    const handleEdit = (app: Application) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const handleAddApplication = async (newApp: Partial<Application>) => {
        const app: Application = {
            id: crypto.randomUUID(),
            userEmail: session?.user?.email || "demo@example.com",
            title: newApp.title || "",
            company: newApp.company || "",
            priority: newApp.priority || "medium",
            status: newApp.status || "wishlist",
            date: new Date().toISOString(),
            ...newApp,
        };

        setApplications(prev => [...prev, app]);
        setIsModalOpen(false);
    };

    const handleUpdateApplication = async (id: string, updates: Partial<Application>) => {
        setApplications(prev =>
            prev.map(app => app.id === id ? { ...app, ...updates } : app)
        );
        setIsModalOpen(false);
    };

    const handleDeleteApplication = async (id: string) => {
        setApplications(prev => prev.filter(app => app.id !== id));
        setIsModalOpen(false);
    };

    const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
        setApplications(prev =>
            prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="max-w-7xl mx-auto w-full space-y-6">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-20" />
                        ))}
                    </div>

                    {/* Board Skeleton */}
                    <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-96" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-1 flex-col gap-6 p-4 md:p-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto w-full space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            Application Board
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track and organize your job applications in one place
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-muted rounded-lg p-1">
                            <Button
                                variant={viewMode === "kanban" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("kanban")}
                                className="gap-2"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="hidden sm:inline">Kanban</span>
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className="gap-2"
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden sm:inline">List</span>
                            </Button>
                        </div>

                        {/* Add Button */}
                        <Button
                            onClick={() => {
                                setSelectedApp(null);
                                setIsModalOpen(true);
                            }}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Application</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                </div>

                {/* Empty State */}
                {applications.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                <Briefcase className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                            <p className="text-muted-foreground mb-4 max-w-md">
                                Start tracking your job applications to stay organized and never miss an opportunity.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Your First Application
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Board Content */}
                {applications.length > 0 && (
                    <AnimatePresence mode="wait">
                        {viewMode === "kanban" ? (
                            <motion.div
                                key="kanban"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <KanbanBoard
                                    applications={applications}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteApplication}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <ListView
                                    applications={applications}
                                    onEdit={handleEdit}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* Gmail Sync Feature */}
                <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <img src="/gmail.svg" alt="Gmail" className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Sync with Gmail</p>
                                <p className="text-xs text-muted-foreground">
                                    Automatically import your job applications from the last 60 days
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30">
                            <Mail className="w-3 h-3" />
                            Connect Now
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Add/Edit Modal */}
            <AddApplicationModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedApp(null);
                }}
                onAdd={handleAddApplication}
                onEdit={handleUpdateApplication}
                onDelete={handleDeleteApplication}
                initialData={selectedApp}
            />
        </div>
    );
}
