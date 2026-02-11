import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { addApplication, getApplications } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const accessToken = session.user.googleAccessToken;

        if (!accessToken) {
            return NextResponse.json({
                error: "No Google Access Token found. Please sign in with Google again.",
                requiresConnect: true
            }, { status: 401 });
        }

        // Initialize Gmail Client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth });

        // 1. Search for messages (LinkedIn only logic from MVP)
        const query = 'from:jobs-noreply@linkedin.com newer_than:60d';
        console.log(`[Gmail Sync] Searching for user ${session.user.email} with query: ${query}`);

        const listRes = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 50,
        });

        const messages = listRes.data.messages || [];
        console.log(`[Gmail Sync] Found ${messages.length} potential email matches`);

        if (messages.length === 0) {
            return NextResponse.json({ syncedCount: 0, applications: [], message: "No new applications found." });
        }

        let syncedCount = 0;
        const savedApplications = [];

        // Fetch existing applications to check for duplicates
        // We fetch all for this user to ensure we don't duplicate based on company/title/date
        const existingApps = await getApplications(session.user.email);

        // 2. Process Messages
        for (const message of messages) {
            try {
                // Get FULL message details
                const msgRes = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                    format: 'full',
                });

                const msgData = msgRes.data;
                const headers = msgData.payload?.headers;
                if (!headers) continue;

                // @ts-ignore
                const subject = headers.find((h: any) => h.name === 'Subject')?.value || "";
                // @ts-ignore
                const from = headers.find((h: any) => h.name === 'From')?.value || "";
                const internalDate = msgData.internalDate; // string timestamp

                // Security check & LinkedIn check
                if (!from.includes('jobs-noreply@linkedin.com')) {
                    continue;
                }

                // Only process APPLICATION CONFIRMATION emails (MVP Logic)
                const isApplicationConfirmation =
                    subject.toLowerCase().includes('application was sent') ||
                    subject.toLowerCase().includes('your application was sent') ||
                    subject.toLowerCase().includes('se ha enviado tu solicitud') ||
                    subject.toLowerCase().includes('application sent:') ||
                    subject.toLowerCase().includes('your application for');

                if (!isApplicationConfirmation) {
                    continue;
                }

                // Extract full body
                const emailBody = extractEmailBody(msgData.payload);
                console.log(`[Gmail Sync] Processing: "${subject}"`);

                // Use Llama to parse the email (MVP Logic)
                const parsedData = await parseEmailWithLlama(subject, emailBody);

                if (!parsedData.role || parsedData.role === "Unknown") {
                    console.log(`[Gmail Sync] ⚠️ Could not extract role, skipping`);
                    continue;
                }

                // Check for duplicates
                // Logic: Same Company + Same Title + Applied within 24 hours of existing date
                const isDuplicate = existingApps.some(app =>
                    app.company.toLowerCase() === parsedData.company.toLowerCase() &&
                    app.title.toLowerCase() === parsedData.role.toLowerCase() &&
                    // Check if existing app has a date/appliedDate and it matches roughly
                    (app.appliedDate || app.date) &&
                    Math.abs(new Date(app.appliedDate || app.date).getTime() - Number(internalDate)) < 86400000 * 2 // 48h window to be safe
                );

                if (!isDuplicate) {
                    const newApp = await addApplication({
                        userEmail: session.user.email!,
                        title: parsedData.role,
                        company: parsedData.company,
                        status: 'applied',
                        priority: 'medium',
                        workMode: 'onsite', // Default, maybe parsedData.location has it?
                        appliedDate: new Date(Number(internalDate)).toISOString(),
                        notes: `Auto-imported from Gmail (${parsedData.jobUrl ? 'with URL' : 'no URL'})`,
                        logo: `https://img.logo.dev/${parsedData.company.replace(/\s+/g, '').toLowerCase()}.com?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`,
                        jobUrl: parsedData.jobUrl || undefined,
                        location: parsedData.location || undefined,
                    });

                    if (newApp) {
                        syncedCount++;
                        savedApplications.push(newApp);
                        console.log(`[Gmail Sync] ➕ Imported: ${parsedData.role} at ${parsedData.company}`);
                    }
                } else {
                    console.log(`[Gmail Sync] ⏭️ Duplicate found: ${parsedData.role} at ${parsedData.company}`);
                }

            } catch (err) {
                console.error(`[Gmail Sync] Error processing message ${message.id}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            syncedCount,
            applications: savedApplications,
            message: `Successfully synced ${syncedCount} applications from Gmail.`
        });

    } catch (error: any) {
        console.error("[Gmail Sync] Error:", error);

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

// --- Helpers from MVP ---

// Extract email body from Gmail API payload
function extractEmailBody(payload: any): string {
    let body = "";

    if (payload.body && payload.body.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                body += Buffer.from(part.body.data, 'base64').toString('utf-8');
            } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
                const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
                body = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            } else if (part.parts) {
                body += extractEmailBody(part);
            }
        }
    }

    return body.trim();
}

// Parse email using Llama 3.3 via Groq (same config as ATS)
async function parseEmailWithLlama(subject: string, body: string): Promise<{
    role: string;
    company: string;
    location: string | null;
    jobUrl: string | null;
}> {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            console.error("[Gmail Sync] GROQ_API_KEY not configured");
            // Fallback if no key (though user implied it worked)
            throw new Error("Missing GROQ_API_KEY");
        }

        // Sanitize inputs to avoid API errors
        const cleanSubject = subject.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
        const cleanBody = body.substring(0, 2000).replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();

        const prompt = `Extract job application information from this LinkedIn email.

SUBJECT: ${cleanSubject}

BODY:
${cleanBody}

Return a JSON object with:
- role: job title (e.g., "AI Engineer")
- company: company name (e.g., "Google España")  
- location: location with work mode (e.g., "Madrid (Hybrid)") or null
- jobUrl: the LinkedIn job posting URL (search for "linkedin.com/jobs/view/" links) or null

If unclear, use "Unknown" for role/company.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 300,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API failed: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";

        const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonString);

        return {
            role: parsed.role || "Unknown",
            company: parsed.company || "Unknown Company",
            location: parsed.location || null,
            jobUrl: parsed.jobUrl || null
        };
    } catch (error) {
        console.error("[Gmail Sync] Llama parsing failed:", error);
        return {
            role: "Unknown",
            company: "Unknown Company",
            location: null,
            jobUrl: null
        };
    }
}
