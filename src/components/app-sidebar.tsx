// @ts-nocheck
"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MoreVertical,
    LogOut,
    User,
    CreditCard,
    Bell,
    Check,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { LordIcon } from "@/components/icons/lord-icon";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
import { Link, useRouter } from "@/i18n/routing";
import { usePathname } from "next/navigation";

// Menu item wrapper with hover state
function AnimatedMenuItem({ href, icon, title }: { href: string; icon: string; title: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link
                    href={href}
                    className="flex items-center gap-3 w-full my-0.5"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <LordIcon
                        src={icon}
                        size={24}
                        onTrigger={isHovered}
                    />
                    <span className="text-[15px] font-medium">{title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

// Menu Groups with Lordicon URLs (JSON)
const jobsItems = [
    {
        title: "Job Search",
        url: "/dashboard/job-search",
        icon: "/animated/wired-outline-2514-hiring-hover-pinch.json"
    },
    {
        title: "Application Board",
        url: "/dashboard/application-board",
        icon: "/animated/wired-outline-1660-noticeboard-hover-pinch.json"
    },
];

const resumesItems = [
    {
        title: "ATS Score",
        url: "/dashboard/resumes/ats-score",
        icon: "/animated/wired-outline-458-goal-target-hover-hit.json"
    },
    {
        title: "CV Builder",
        url: "/dashboard/resumes",
        icon: "/animated/wired-outline-982-cv-curriculum-vitae-resume-hover-swipe.json"
    },
    {
        title: "Cover Letters",
        url: "/dashboard/cover-letters",
        icon: "/animated/wired-outline-2344-poetry-hover-pinch.json"
    },
];

const interviewItems = [
    {
        title: "AI Simulator",
        url: "/dashboard/interview-coach",
        icon: "/animated/wired-outline-188-microphone-recording-hover-recording.json"
    },
    {
        title: "Playbooks",
        url: "/dashboard/playbooks",
        icon: "/animated/wired-outline-1142-form-sheet-questionnaire-hover-pinch.json"
    },
];

import { useProfileCompletion } from "@/contexts/profile-completion-context";

// ... (keep other imports)

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    // completionStatus removed
    onOpenReferModal: () => void;
    onOpenUploadModal?: () => void;
}

export function AppSidebar({ user, onOpenReferModal, onOpenUploadModal, ...props }: AppSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { status } = useProfileCompletion();

    const [dashboardHovered, setDashboardHovered] = useState(false);
    const [profileHovered, setProfileHovered] = useState(false);
    const [expertHovered, setExpertHovered] = useState(false);
    const [referHovered, setReferHovered] = useState(false);

    // State to hide the completion box when profile is 100% complete
    const [hideCompletionBox, setHideCompletionBox] = useState(false);

    const isProfileActive = pathname?.includes("profile");
    const isFullyComplete = status?.totalProgress === 100;

    // Auto-hide the box after 3 seconds when profile is fully complete
    React.useEffect(() => {
        if (isFullyComplete) {
            const timer = setTimeout(() => {
                setHideCompletionBox(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            // Show the box again if profile becomes incomplete
            setHideCompletionBox(false);
        }
    }, [isFullyComplete]);

    // Determine if we should show the completion box
    const showCompletionBox = isProfileActive && !hideCompletionBox;

    // Helper to render completion check circle
    const StatusCircle = ({ completed }: { completed?: boolean }) => (
        <div className={`size-4 rounded-full border-2 flex items-center justify-center transition-colors ${completed
            ? "border-blue-500 bg-blue-500"
            : "border-gray-300 dark:border-gray-600"
            }`}>
            {completed && <Check className="size-2.5 text-white" strokeWidth={3} />}
        </div>
    );

    return (
        <Sidebar variant="inset" {...props}>
            {/* ... header ... */}
            <SidebarHeader className="p-4 flex flex-row items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 -ml-1">
                    <Logo className="h-8 w-auto dark:hidden" />
                    <Logo variant="white" className="h-8 w-auto hidden dark:block" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                {/* ... (keep groups up to Resumes) ... */}

                {/* Dashboard Group */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 w-full my-0.5"
                                        onMouseEnter={() => setDashboardHovered(true)}
                                        onMouseLeave={() => setDashboardHovered(false)}
                                    >
                                        <LordIcon
                                            src="/animated/wired-lineal-153-bar-chart-hover-pinch.json"
                                            size={24}
                                            onTrigger={dashboardHovered}
                                        />
                                        <span className="text-[15px] font-medium">Dashboard</span>
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
                                <AnimatedMenuItem
                                    key={item.title}
                                    href={item.url}
                                    icon={item.icon}
                                    title={item.title}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>


                {/* Resumes Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Resumes</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Profile Collapsible */}
                            <SidebarMenuItem>
                                <div className="w-full">
                                    <Link href="/dashboard/profile" className="w-full">
                                        <div
                                            className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors"
                                            onMouseEnter={() => setProfileHovered(true)}
                                            onMouseLeave={() => setProfileHovered(false)}
                                        >
                                            <LordIcon
                                                src="/animated/wired-outline-44-avatar-user-in-circle-hover-looking-around.json"
                                                size={24}
                                                onTrigger={profileHovered}
                                            />
                                            <span className="text-[15px] font-medium flex-1 text-left">Profile</span>
                                        </div>
                                    </Link>

                                    <AnimatePresence>
                                        {showCompletionBox && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="pb-2 px-0 pt-2 pl-3 overflow-hidden"
                                            >
                                                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                                                    <h3 className="text-sm font-semibold mb-2">Complete your profile</h3>
                                                    <p className="text-xs text-muted-foreground mb-3">
                                                        A complete profile helps us match you with relevant jobs and personalize our AI tools to you.
                                                    </p>

                                                    <div className="mb-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                                            style={{ width: `${status?.totalProgress || 0}%` }}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Link href="/dashboard/profile" className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors">
                                                            <StatusCircle completed={status?.overview} />
                                                            <span>Overview</span>
                                                        </Link>
                                                        <Link href="/dashboard/profile?tab=tech-stack" className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors">
                                                            <StatusCircle completed={status?.techStack} />
                                                            <span>Tech Stack</span>
                                                        </Link>
                                                        <Link href="/dashboard/profile?tab=experience" className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors">
                                                            <StatusCircle completed={status?.experience} />
                                                            <span>Experience</span>
                                                        </Link>
                                                        <Link href="/dashboard/profile?tab=projects" className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors">
                                                            <StatusCircle completed={status?.projects} />
                                                            <span>Projects</span>
                                                        </Link>
                                                        <Link href="/dashboard/profile?tab=education" className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors">
                                                            <StatusCircle completed={status?.education} />
                                                            <span>Education</span>
                                                        </Link>
                                                        <Link href="/dashboard/profile?tab=certifications" className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors">
                                                            <StatusCircle completed={status?.certifications} />
                                                            <span>Certifications</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </SidebarMenuItem>

                            {resumesItems.map((item) => (
                                <AnimatedMenuItem
                                    key={item.title}
                                    href={item.url}
                                    icon={item.icon}
                                    title={item.title}
                                />
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
                                <AnimatedMenuItem
                                    key={item.title}
                                    href={item.url}
                                    icon={item.icon}
                                    title={item.title}
                                />
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
                                className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-medium w-full my-0.5 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                onMouseEnter={() => setExpertHovered(true)}
                                onMouseLeave={() => setExpertHovered(false)}
                            >
                                <LordIcon
                                    src="/animated/wired-lineal-724-diamond-luxury-precious-hover-pinch.json"
                                    size={24}
                                    onTrigger={expertHovered}
                                />
                                <span className="flex-1 text-[15px]">Expert Review</span>
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
                                className="flex items-center gap-3 text-green-600 dark:text-green-500 font-medium w-full cursor-pointer my-0.5"
                                onMouseEnter={() => setReferHovered(true)}
                                onMouseLeave={() => setReferHovered(false)}
                            >
                                <LordIcon
                                    src="/animated/wired-lineal-412-gift-hover-squeeze.json"
                                    size={24}
                                    onTrigger={referHovered}
                                />
                                <span className="flex-1 text-[15px]">Refer a Friend</span>
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
