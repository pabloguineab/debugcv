"use client";

import type { Application } from "@/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Briefcase,
    Target,
    Users,
    CheckCircle2,
    XCircle,
    TrendingUp
} from "lucide-react";

interface StatsCardsProps {
    applications: Application[];
}

export function StatsCards({ applications }: StatsCardsProps) {
    const stats = [
        {
            label: "Wishlist",
            value: applications.filter(a => a.status === "wishlist").length,
            icon: Briefcase,
            color: "text-gray-600 dark:text-gray-400",
            bgColor: "bg-gray-100 dark:bg-gray-800",
        },
        {
            label: "Applied",
            value: applications.filter(a => a.status === "applied").length,
            icon: Target,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            label: "Interviews",
            value: applications.filter(a => a.status === "interview").length,
            icon: Users,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
        },
        {
            label: "Offers",
            value: applications.filter(a => a.status === "offer").length,
            icon: CheckCircle2,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100 dark:bg-green-900/30",
        },
    ];

    // Calculate success rate
    const totalWithOutcome = applications.filter(a =>
        ["offer", "rejected"].includes(a.status)
    ).length;
    const offers = applications.filter(a => a.status === "offer").length;
    const successRate = totalWithOutcome > 0 ? Math.round((offers / totalWithOutcome) * 100) : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {stats.map((stat) => (
                <Card key={stat.label} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Success Rate Card */}
            <Card className="hover:shadow-md transition-shadow hidden lg:block">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{successRate}%</p>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
