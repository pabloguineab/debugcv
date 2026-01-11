"use client";

import { useState } from "react";
import type { Application, ApplicationStatus } from "@/types/application";
import { CompanyLogo } from "@/components/company-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    MoreVertical,
    ExternalLink,
    MapPin,
    Building2,
    ArrowUpDown,
} from "lucide-react";

interface ListViewProps {
    applications: Application[];
    onEdit: (app: Application) => void;
}

const statusColors: Record<ApplicationStatus, string> = {
    wishlist: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    interview: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    offer: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const priorityColors = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-gray-400",
};

export function ListView({ applications, onEdit }: ListViewProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
    const [sortBy, setSortBy] = useState<"date" | "company" | "title">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Filter and sort applications
    const filteredApps = applications
        .filter(app => {
            const matchesSearch =
                app.title.toLowerCase().includes(search.toLowerCase()) ||
                app.company.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "date":
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case "company":
                    comparison = a.company.localeCompare(b.company);
                    break;
                case "title":
                    comparison = a.title.localeCompare(b.title);
                    break;
            }
            return sortOrder === "desc" ? -comparison : comparison;
        });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const toggleSort = (column: "date" | "company" | "title") => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    return (
        <Card>
            <CardContent className="p-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or company..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "all")}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="wishlist">Wishlist</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1 -ml-3"
                                        onClick={() => toggleSort("title")}
                                    >
                                        Job
                                        <ArrowUpDown className="w-3 h-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1 -ml-3"
                                        onClick={() => toggleSort("company")}
                                    >
                                        Company
                                        <ArrowUpDown className="w-3 h-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1 -ml-3"
                                        onClick={() => toggleSort("date")}
                                    >
                                        Date
                                        <ArrowUpDown className="w-3 h-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApps.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {search || statusFilter !== "all"
                                            ? "No applications match your filters"
                                            : "No applications yet. Add your first one!"
                                        }
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApps.map((app) => (
                                    <TableRow
                                        key={app.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => onEdit(app)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${priorityColors[app.priority]}`} />
                                                <span className="font-medium">{app.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CompanyLogo company={app.company} logo={app.logo} size="sm" />
                                                {app.company}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {app.location && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[120px]">{app.location}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[app.status]} variant="secondary">
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(app.date)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(app);
                                                    }}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {app.jobUrl && (
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(app.jobUrl, '_blank');
                                                        }}>
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            View Job
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Results count */}
                <div className="mt-3 text-sm text-muted-foreground">
                    Showing {filteredApps.length} of {applications.length} applications
                </div>
            </CardContent>
        </Card>
    );
}
