// @ts-nocheck
"use client";

import * as React from "react";
import {
    LayoutDashboard,
    SquareTerminal,
    BarChart3,
    FolderKanban,
    Users,
    Database,
    FileText,
    Bot,
    MoreHorizontal,
    MoreVertical,
    Settings,
    CircleHelp,
    Search,
    LogOut,
    User,
    CreditCard,
    Bell,
} from "lucide-react";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const homeItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Lifecycle", url: "#", icon: SquareTerminal },
    { title: "Analytics", url: "#", icon: BarChart3 },
    { title: "Projects", url: "#", icon: FolderKanban },
    { title: "Team", url: "#", icon: Users },
];

const documentsItems = [
    { title: "Data Library", url: "#", icon: Database },
    { title: "Reports", url: "#", icon: FileText },
    { title: "Word Assistant", url: "#", icon: Bot },
    { title: "More", url: "#", icon: MoreHorizontal },
];

interface AppSidebarProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader className="p-4">
                <a href="/dashboard">
                    <span className="text-lg font-bold">DebugCV</span>
                </a>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Home</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {homeItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center gap-2">
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Documents</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {documentsItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center gap-2">
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </a>
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
                            <a href="#" className="flex items-center gap-2">
                                <Settings className="size-4" />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="#" className="flex items-center gap-2">
                                <CircleHelp className="size-4" />
                                <span>Get Help</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="#" className="flex items-center gap-2">
                                <Search className="size-4" />
                                <span>Search</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <div className="flex items-center w-full">
                                <div className="flex items-center gap-2 flex-1 p-2">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name || "shadcn"}</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email || "m@example.com"}</span>
                                    </div>
                                </div>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 hover:bg-sidebar-accent rounded-md">
                                        <MoreVertical className="size-4" />
                                    </button>
                                </DropdownMenuTrigger>
                            </div>
                            <DropdownMenuContent
                                className="min-w-56 rounded-lg"
                                side="right"
                                align="end"
                                sideOffset={8}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                            <AvatarFallback className="rounded-lg">
                                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name || "shadcn"}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user?.email || "m@example.com"}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="flex items-center gap-2">
                                        <User className="size-4" />
                                        Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center gap-2">
                                        <CreditCard className="size-4" />
                                        Billing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center gap-2">
                                        <Bell className="size-4" />
                                        Notifications
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })} className="flex items-center gap-2">
                                    <LogOut className="size-4" />
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
