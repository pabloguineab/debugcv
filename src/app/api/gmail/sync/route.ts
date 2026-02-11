import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { parseJobApplicationEmail } from "@/lib/gmail-parser";
import { addApplication } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore - googleAccessToken is added in session callback
        const accessToken = session.user.googleAccessToken;

        if (!accessToken) {
            return NextResponse.json({
                error: "No Google Access Token found. Please sign in with Google again."
            }, { status: 403 });
        }

        // Initialize Gmail Client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth });

        // Calculate date 60 days ago
        const date = new Date();
        date.setDate(date.getDate() - 60);
        const afterDate = Math.floor(date.getTime() / 1000); // Unix timestamp

        // Search query: looking for typical application subjects
        // Broad search to capture EN, ES, FR, IT
        const query = `after:${afterDate} (subject:application OR subject:solicitud OR subject:candidature OR subject:candidatura OR from:linkedin.com OR from:indeed.com OR from:infojobs.net OR from:glassdoor.com)`;

        console.log(`[Gmail Sync] Searching for user ${session.user.email} with query: ${query}`);

        // 1. List Messages
        const listRes = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 20, // Limit to recent 20 to avoid timeouts/rate limits in this sync
        });

        const messages = listRes.data.messages || [];
        console.log(`[Gmail Sync] Found ${messages.length} potential messages`);

        if (messages.length === 0) {
            return NextResponse.json({ syncedCount: 0, message: "No new applications found." });
        }

        let syncedCount = 0;
        const potentialApplications = [];

        // 2. Fetch Details & Parse (Parallel execution with Promise.all for speed)
        const parsePromises = messages.map(async (msg) => {
            try {
                const detailedMsg = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!,
                    format: 'full', // We need headers and snippet
                });

                return await parseJobApplicationEmail(detailedMsg.data, gmail);
            } catch (err) {
                console.error(`Error fetching message ${msg.id}:`, err);
                return null;
            }
        });

        const results = await Promise.all(parsePromises);

        // Filter out nulls
        const validApplications = results.filter(app => app !== null);
        console.log(`[Gmail Sync] Parsed ${validApplications.length} valid applications`);

        // 3. Save to Database
        for (const app of validApplications) {
            if (!app) continue;

            // TODO: Avoid duplicates. Ideally check if (company + title + date) already exists.
            // For now, we rely on the DB ID or just add them (user can delete duplicates).
            // A more robust implementation would check Supabase first.

            const newApp = await addApplication({
                userEmail: session.user.email,
                title: app.job_title,
                company: app.company_name,
                status: 'applied', // Default status for scraping
                priority: 'medium',
                workMode: 'onsite', // Default fallback
                appliedDate: app.applied_at, // Mapping parsed date
                notes: `Imported from Gmail (${app.platform})`,
                // Try to get logo if available via our utils (frontend usually does this, but we can try)
                logo: `https://img.logo.dev/${app.company_name.replace(/\s+/g, '').toLowerCase()}.com?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`,
            });

            if (newApp) {
                syncedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            syncedCount,
            message: `Successfully synced ${syncedCount} applications from Gmail.`
        });

    } catch (error: any) {
        console.error("[Gmail Sync] Error:", error);

        // Handle token expiry or revocation or insufficient permissions
        const status = error.code || (error.response && error.response.status);
        if (status === 401 || status === 403) {
            return NextResponse.json({
                error: "Google Token Expired or Insufficient Permissions",
                requiresConnect: true
            }, { status: 401 });
        }

        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
