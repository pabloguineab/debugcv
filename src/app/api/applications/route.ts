import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getApplications, addApplication } from "@/lib/supabase";
import type { Application } from "@/types/application";

// GET /api/applications - Get all applications for the current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applications = await getApplications(userEmail);
        return NextResponse.json(applications);
    } catch (error) {
        console.error("[API] Error getting applications:", error);
        return NextResponse.json({ error: "Failed to get applications" }, { status: 500 });
    }
}

// POST /api/applications - Add a new application
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const newApp: Omit<Application, 'id' | 'date'> = {
            userEmail,
            title: body.title || "",
            company: body.company || "",
            logo: body.logo,
            jobUrl: body.jobUrl,
            location: body.location,
            workMode: body.workMode,
            expectedSalary: body.expectedSalary,
            priority: body.priority || "medium",
            status: body.status || "wishlist",
            coverLetter: body.coverLetter,
            notes: body.notes,
            jobDescription: body.jobDescription,
            matchAnalysis: body.matchAnalysis,
            contacts: body.contacts,
            history: body.history,
            appliedDate: body.appliedDate,
            interviewDate: body.interviewDate,
            offerDate: body.offerDate,
            rejectedDate: body.rejectedDate,
        };

        const application = await addApplication(newApp);

        if (!application) {
            return NextResponse.json({ error: "Failed to add application" }, { status: 500 });
        }

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error("[API] Error adding application:", error);
        return NextResponse.json({ error: "Failed to add application" }, { status: 500 });
    }
}
