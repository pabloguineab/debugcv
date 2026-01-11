"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Application, ApplicationStatus, STATUS_COLUMNS } from "@/types/application";
import { CompanyLogo } from "@/components/company-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Building2,
    MapPin,
    DollarSign,
    Calendar,
    MoreVertical,
    ExternalLink,
    Flag,
    GripVertical,
    Trash2,
    Pencil,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLUMNS: { id: ApplicationStatus; title: string; color: string; bgColor: string }[] = [
    { id: 'wishlist', title: 'Wishlist', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'applied', title: 'Applied', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'interview', title: 'Interview', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { id: 'offer', title: 'Offer', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
];

interface KanbanBoardProps {
    applications: Application[];
    onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
}

export function KanbanBoard({ applications, onStatusChange, onEdit, onDelete }: KanbanBoardProps) {
    const [draggedApp, setDraggedApp] = useState<Application | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null);

    const getApplicationsByStatus = (status: ApplicationStatus) => {
        return applications.filter(app => app.status === status);
    };

    const handleDragStart = (app: Application) => {
        setDraggedApp(app);
    };

    const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
        e.preventDefault();
        if (draggedApp && draggedApp.status !== status) {
            setDragOverColumn(status);
        }
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
        e.preventDefault();
        if (draggedApp && draggedApp.status !== status) {
            onStatusChange(draggedApp.id, status);
        }
        setDraggedApp(null);
        setDragOverColumn(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            {COLUMNS.map((column) => {
                const count = getApplicationsByStatus(column.id).length;
                return (
                    <div
                        key={column.id}
                        className={`rounded-2xl transition-all duration-200 ${dragOverColumn === column.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 shadow-lg'
                            : 'bg-muted/20 dark:bg-muted/10'
                            }`}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className={`flex items-center justify-between p-4 border-b border-border/50 ${column.bgColor} rounded-t-2xl`}>
                            <div className="flex items-center gap-2">
                                <h3 className={`font-semibold text-sm ${column.color}`}>{column.title}</h3>
                            </div>
                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${column.bgColor} ${column.color}`}>
                                {count}
                            </div>
                        </div>

                        {/* Cards Container */}
                        <div className="p-3 space-y-3 min-h-[200px]">
                            {getApplicationsByStatus(column.id).map((app) => (
                                <JobCard
                                    key={app.id}
                                    application={app}
                                    onDragStart={() => handleDragStart(app)}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}

                            {/* Empty State */}
                            {count === 0 && (
                                <div className="py-12 px-4 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                                    <p className="mb-1">📋</p>
                                    <p>Drop applications here</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface JobCardProps {
    application: Application;
    onDragStart: () => void;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
}

function JobCard({ application, onDragStart, onEdit, onDelete }: JobCardProps) {
    const priorityConfig = {
        high: { color: 'bg-red-500', label: 'High', textColor: 'text-red-600 dark:text-red-400' },
        medium: { color: 'bg-amber-500', label: 'Medium', textColor: 'text-amber-600 dark:text-amber-400' },
        low: { color: 'bg-gray-400', label: 'Low', textColor: 'text-gray-500 dark:text-gray-400' },
    };

    const workModeLabels = {
        remote: '🌍 Remote',
        hybrid: '🏠 Hybrid',
        onsite: '🏢 On-site',
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            draggable
            onDragStart={onDragStart}
            className="cursor-grab active:cursor-grabbing"
        >
            <Card
                className="bg-card hover:shadow-lg transition-all duration-200 group border-l-4 hover:translate-y-[-2px]"
                style={{
                    borderLeftColor: application.priority === 'high' ? '#ef4444' :
                        application.priority === 'medium' ? '#f59e0b' : '#9ca3af'
                }}
                onClick={() => onEdit(application)}
            >
                <CardContent className="p-4">
                    {/* Company & Actions Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <CompanyLogo
                                company={application.company}
                                logo={application.logo}
                                size="md"
                            />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-sm truncate text-foreground">{application.title}</h4>
                                <p className="text-xs text-muted-foreground truncate">{application.company}</p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(application);
                                }}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                {application.jobUrl && (
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(application.jobUrl, '_blank');
                                    }}>
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Job
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this application?')) {
                                            onDelete(application.id);
                                        }
                                    }}
                                    className="text-red-600 dark:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        {/* Location & Work Mode */}
                        {(application.location || application.workMode) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {application.location && (
                                    <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[80px]">{application.location}</span>
                                    </div>
                                )}
                                {application.workMode && (
                                    <span className="bg-muted/50 px-2 py-1 rounded-md">
                                        {workModeLabels[application.workMode]}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Salary */}
                        {application.expectedSalary && (
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                <DollarSign className="w-3 h-3" />
                                <span>{application.expectedSalary}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${priorityConfig[application.priority].color}`} />
                            <span className={`text-xs font-medium ${priorityConfig[application.priority].textColor}`}>
                                {priorityConfig[application.priority].label}
                            </span>
                        </div>
                        {application.appliedDate && (
                            <span className="text-xs text-muted-foreground">
                                {formatDate(application.appliedDate)}
                            </span>
                        )}
                    </div>

                    {/* Match Score - Highlighted */}
                    {application.matchAnalysis && (
                        <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2">
                                <span className="text-xs font-medium text-muted-foreground">Match Score</span>
                                <Badge
                                    className={`text-xs font-bold ${application.matchAnalysis.score >= 80
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : application.matchAnalysis.score >= 60
                                            ? 'bg-amber-500 hover:bg-amber-600'
                                            : 'bg-gray-500 hover:bg-gray-600'
                                        }`}
                                >
                                    {application.matchAnalysis.score}%
                                </Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
