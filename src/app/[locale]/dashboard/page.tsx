"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Flame, Target, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardLineChart, DashboardRadarChart, DashboardRadialChart } from "./components/dashboard-charts";

const tableData = [
    { header: "Cover page", type: "Cover page", status: "In Process", target: 18, limit: 5, reviewer: "Eddie Laine" },
    { header: "Table of contents", type: "Table of contents", status: "Done", target: 29, limit: 24, reviewer: "Eddie Laine" },
    { header: "Executive summary", type: "Narrative", status: "Done", target: 10, limit: 13, reviewer: "Eddie Laine" },
    { header: "Technical approach", type: "Narrative", status: "Done", target: 27, limit: 23, reviewer: "Jamik Tashpulatov" },
    { header: "Design", type: "Narrative", status: "In Process", target: 2, limit: 16, reviewer: "Jamik Tashpulatov" },
    { header: "Capabilities", type: "Narrative", status: "In Process", target: 20, limit: 8, reviewer: "Jamik Tashpulatov" },
];

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Applications Sent */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+5</span> this week
                        </p>
                    </CardContent>
                </Card>

                {/* Active Processes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">
                            3 waiting for reply
                        </p>
                    </CardContent>
                </Card>

                {/* Avg. ATS Score */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. ATS Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85<span className="text-lg text-muted-foreground">/100</span></div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+12%</span> vs last month
                        </p>
                    </CardContent>
                </Card>

                {/* Interview Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
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

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Document Sections</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Header</TableHead>
                                <TableHead>Section Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Target</TableHead>
                                <TableHead className="text-right">Limit</TableHead>
                                <TableHead>Reviewer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((item) => (
                                <TableRow key={item.header}>
                                    <TableCell className="font-medium">{item.header}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.type}</TableCell>
                                    <TableCell>
                                        {item.status === "Done" ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span>Done</span>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground font-normal">
                                                {item.status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">{item.target}</TableCell>
                                    <TableCell className="text-right">{item.limit}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.reviewer}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
