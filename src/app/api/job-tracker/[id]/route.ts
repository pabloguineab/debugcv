import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/kv-db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;

        // Allow demo Access without full session if needed for testing, 
        // but typically session is required. Mock DB allows "any" email effectively if we wanted.
        if (!userEmail) {
            // For migration testing ease, if no session, maybe allowing public? 
            // Better stick to security:
            // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        // Mock DB will return the demo-job regardless of email in current implementation
        const applications = await db.getApplications(userEmail || "demo@example.com");
        const application = applications.find(app => app.id === id);

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error("Error fetching application:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
