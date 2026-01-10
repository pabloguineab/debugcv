"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Activity, TrendingUp } from "lucide-react";
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,250.00</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+12.5%</span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-500">-20%</span> this period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45,678</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+12.5%</span> engagement
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.5%</div>
                        <p className="text-xs text-muted-foreground">
                            Steady performance increase
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
