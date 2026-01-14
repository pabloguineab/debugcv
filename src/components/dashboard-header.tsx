"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { Fragment } from "react";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";

const routeNames: Record<string, string> = {
    "dashboard": "Dashboard",
    "job-search": "Job Search",
    "application-board": "Application Board",
    "resumes": "My Versions",
    "ats-score": "ATS Score",
    "cover-letters": "Cover Letters",
    "interview-coach": "AI Simulator",
    "playbooks": "Playbooks",
    "strategy": "Strategy",
};

export function DashboardHeader() {
    const pathname = usePathname();
    const { activeTab } = useBreadcrumb();

    // Extract the path segments after locale (e.g., /en/dashboard/playbooks/strategy -> ['dashboard', 'playbooks', 'strategy'])
    const segments = pathname?.split('/').filter(Boolean) || [];
    // Remove locale segment if present (2-letter codes like 'en', 'es')
    const dashboardIndex = segments.findIndex(s => s === 'dashboard');
    const pathSegments = dashboardIndex >= 0 ? segments.slice(dashboardIndex) : segments;

    // Skip the 'dashboard' segment from breadcrumbs (we already have Home)
    const filteredSegments = pathSegments.filter(s => s !== 'dashboard');

    // Build breadcrumb items
    const breadcrumbItems = filteredSegments.map((segment, index) => {
        const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        // Build the full path including dashboard prefix
        const href = '/dashboard/' + filteredSegments.slice(0, index + 1).join('/');
        const isLast = index === filteredSegments.length - 1 && !activeTab;

        return { name, href, isLast };
    });

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbItems.map((item) => (
                        <Fragment key={item.href}>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                {item.isLast ? (
                                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    ))}
                    {activeTab && (
                        <Fragment>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{activeTab}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </Fragment>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            {/* Spacer to push ModeToggle to the right */}
            <div className="flex-1" />

            {/* Mode Toggle in top-right corner */}
            <ModeToggle />
        </header>
    );
}
