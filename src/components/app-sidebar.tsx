// @ts-nocheck
"use client";

import * as React from "react";
import { useState } from "react";
import {
    ClipboardList,
    Globe,
    FileText,
    Target,
    PenTool,
    Bot,
    BookOpen,
    Gem,
    MoreVertical,
    LogOut,
    User,
    CreditCard,
    Bell,
    Gift,
} from "lucide-react";
import { DashboardChartIcon } from "@/components/icons/dashboard-chart-icon";
import { signOut } from "next-auth/react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import { Link } from "@/i18n/routing";

// Menu Groups with custom animations
const jobsItems = [
    { title: "Job Search", url: "/dashboard/job-search", icon: Globe, animation: "group-hover/icon-hover:animate-[icon-globe-rotate_0.6s_ease-in-out]" },
    { title: "Application Board", url: "/dashboard/application-board", icon: ClipboardList, animation: "group-hover/icon-hover:animate-[icon-bounce_0.5s_ease-in-out]" },
];

const resumesItems = [
    { title: "My Versions", url: "/dashboard/resumes", icon: FileText, animation: "group-hover/icon-hover:animate-[icon-bounce_0.5s_ease-in-out]" },
    { title: "ATS Score", url: "/dashboard/resumes/ats-score", icon: Target, animation: "group-hover/icon-hover:animate-[icon-pulse_0.5s_ease-in-out]" },
    { title: "Cover Letters", url: "/dashboard/cover-letters", icon: PenTool, animation: "group-hover/icon-hover:animate-[icon-pen-write_0.5s_ease-in-out]" },
];

const interviewItems = [
    { title: "AI Simulator", url: "/dashboard/interview-coach", icon: Bot, animation: "group-hover/icon-hover:animate-[icon-shake_0.5s_ease-in-out]" },
    { title: "Playbooks", url: "/dashboard/playbooks", icon: BookOpen, animation: "group-hover/icon-hover:animate-[icon-page-turn_0.6s_ease-in-out]" },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    onOpenReferModal: () => void;
    onOpenUploadModal?: () => void;
}

export function AppSidebar({ user, onOpenReferModal, onOpenUploadModal, ...props }: AppSidebarProps) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader className="p-4 flex flex-row items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 -ml-1">
                    <Logo className="h-8 w-auto dark:hidden" />
                    <Logo variant="white" className="h-8 w-auto hidden dark:block" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                {/* Dashboard - Standalone Group */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard" className="group/icon-hover flex items-center gap-3 w-full my-0.5">
                                        <DashboardChartIcon className="size-[18px]" />
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Jobs Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Jobs</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {jobsItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className="group/icon-hover flex items-center gap-3 w-full my-0.5">
                                            <item.icon className={`size-[18px] ${item.animation}`} />
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Resumes Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Resumes</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {resumesItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className="group/icon-hover flex items-center gap-3 w-full my-0.5">
                                            <item.icon className={`size-[18px] ${item.animation}`} />
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Interview Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Interview</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {interviewItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className="group/icon-hover flex items-center gap-3 w-full my-0.5">
                                            <item.icon className={`size-[18px] ${item.animation}`} />
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <div
                                onClick={onOpenUploadModal}
                                className="group/icon-hover flex items-center gap-3 text-blue-600 dark:text-blue-400 font-medium w-full my-0.5 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Gem className="size-[18px] group-hover/icon-hover:animate-[icon-sparkle_0.5s_ease-in-out]" />
                                <span className="flex-1 text-sm">Get Expert Review</span>
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold dark:bg-blue-900/40 dark:text-blue-400 group-data-[collapsible=icon]:hidden">
                                    FREE
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <div
                                onClick={onOpenReferModal}
                                className="group/icon-hover flex items-center gap-3 text-green-600 dark:text-green-500 font-medium w-full cursor-pointer my-0.5"
                            >
                                <Gift className="size-[18px] group-hover/icon-hover:animate-[icon-shake_0.5s_ease-in-out]" />
                                <span className="flex-1 text-sm">Refer a Friend</span>
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold dark:bg-green-900/40 dark:text-green-400 group-data-[collapsible=icon]:hidden">
                                    -30%
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="mt-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring cursor-pointer h-12 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:justify-center"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                            <AvatarFallback className="rounded-lg">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="size-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            {user?.name ? (
                                                <>
                                                    <span className="truncate font-semibold">{user.name}</span>
                                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                                                    <div className="h-2 w-24 rounded bg-muted animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                        <MoreVertical className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                    </button>
                                }
                            />
                            <DropdownMenuContent
                                className="w-56 rounded-lg"
                                side="right"
                                align="end"
                                sideOffset={8}
                            >
                                <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        {user?.name ? (
                                            <>
                                                <span className="truncate font-semibold">{user.name}</span>
                                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                            </>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                                                <div className="h-2 w-24 rounded bg-muted animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Billing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Bell className="mr-2 h-4 w-4" />
                                        Notifications
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
