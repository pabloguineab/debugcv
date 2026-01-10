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

const routeNames: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/job-search": "Job Search",
    "/dashboard/application-board": "Application Board",
    "/dashboard/resumes": "My Versions",
    "/dashboard/ats-score": "ATS Score",
    "/dashboard/cover-letters": "Cover Letters",
    "/dashboard/interview-coach": "AI Simulator",
    "/dashboard/playbooks": "Playbooks",
};

export function DashboardHeader() {
    const pathname = usePathname();
    // Remove local prefix if present (e.g. /en/dashboard -> /dashboard)
    // Assuming pathname might contain locale like /en/dashboard/...
    // Simpler approach: match the end of the string

    let currentName = "Dashboard";

    // Normalize path to exclude locale if possible, or just match segments
    // A robust way normally involves useLocale from next-intl, but let's try simple matching first.

    // Check exact matches first
    Object.keys(routeNames).forEach((path) => {
        if (pathname?.endsWith(path)) {
            currentName = routeNames[path];
        }
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
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{currentName}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}
