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
    "resumes": "CV Builder",
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

    // Generate breadcrumb items
    const breadcrumbItems = pathSegments
        .map((segment, index) => {
            // Skip 'dashboard' since we explicitly add 'Home' link
            if (segment === 'dashboard') return null;

            // Skip 'resumes' if we are on 'ats-score' page (visual flattening)
            if (segment === 'resumes' && pathSegments.includes('ats-score')) return null;

            const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

            // Construct full href path up to this segment
            const href = '/' + pathSegments.slice(0, index + 1).join('/');

            return { name, href, isLast: false };
        })
        .filter((item): item is { name: string; href: string; isLast: boolean } => item !== null);

    // Set isLast for the final item
    if (breadcrumbItems.length > 0) {
        breadcrumbItems[breadcrumbItems.length - 1].isLast = !activeTab;
    }

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
