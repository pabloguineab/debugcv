import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ParsedApplication {
    id: string;
    title: string;
    company: string;
    location: string | null;
    jobUrl: string | null;
    appliedDate: string;
    status: "applied";
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let accessToken = (session?.user as any)?.googleAccessToken;

        // Fallback: if the user IS logged in with Google as primary, use the primary accessToken
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!accessToken && (session?.user as any)?.provider === 'google') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accessToken = (session?.user as any)?.accessToken;
        }

        if (!session || !accessToken) {
            return NextResponse.json({
                error: "Requires Google Sign-In",
                requiresConnect: true
            }, { status: 401 });
        }

        // 1. Search for messages
        const query = 'from:jobs-noreply@linkedin.com newer_than:60d';
        const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`;

        const searchRes = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!searchRes.ok) {
            throw new Error(`Gmail API Error: ${searchRes.statusText}`);
        }

        const searchData = await searchRes.json();
        const messages = searchData.messages || [];

        console.log(`[Gmail Sync] Found ${messages.length} emails matching query`);

        const importedApplications: ParsedApplication[] = [];

        for (const message of messages) {
            try {
                // 2. Get FULL message details
                const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (!msgRes.ok) {
                    console.log(`[Gmail Sync] Failed to fetch message ${message.id}`);
                    continue;
                }

                const msgData = await msgRes.json();
                const headers = msgData.payload.headers;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const subject = headers.find((h: any) => h.name === 'Subject')?.value || "";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const from = headers.find((h: any) => h.name === 'From')?.value || "";
                const internalDate = msgData.internalDate;

                // Security check: Only process emails from LinkedIn
                if (!from.includes('jobs-noreply@linkedin.com')) {
                    console.log(`[Gmail Sync] ⛔ Skipping non-LinkedIn email from: ${from}`);
                    continue;
                }

                // Only process APPLICATION CONFIRMATION emails
                const isApplicationConfirmation =
                    subject.toLowerCase().includes('application was sent') ||
                    subject.toLowerCase().includes('your application was sent') ||
                    subject.toLowerCase().includes('se ha enviado tu solicitud') ||
                    subject.toLowerCase().includes('application sent:') ||
                    subject.toLowerCase().includes('your application for');

                if (!isApplicationConfirmation) {
                    console.log(`[Gmail Sync] ⏭️ Skipping non-application email: "${subject}"`);
                    continue;
                }

                // Extract full body
                const emailBody = extractEmailBody(msgData.payload);

                console.log(`[Gmail Sync] Processing: "${subject}"`);

                // Use Llama to parse the email
                const parsedData = await parseEmailWithLlama(subject, emailBody);

                if (!parsedData.role || parsedData.role === "Unknown") {
                    console.log(`[Gmail Sync] ⚠️ Could not extract role, skipping`);
                    continue;
                }

                console.log(`[Gmail Sync] ✅ Parsed - Role: "${parsedData.role}", Company: "${parsedData.company}"`);

                // Check for duplicates in memory
                const isDuplicate = importedApplications.some(app =>
                    app.company === parsedData.company &&
                    app.title === parsedData.role
                );

                if (!isDuplicate) {
                    importedApplications.push({
                        id: message.id,
                        title: parsedData.role,
                        company: parsedData.company,
                        location: parsedData.location,
                        jobUrl: parsedData.jobUrl,
                        appliedDate: new Date(Number(internalDate)).toISOString(),
                        status: "applied"
                    });
                    console.log(`[Gmail Sync] ➕ Imported: ${parsedData.role} at ${parsedData.company}`);
                } else {
                    console.log(`[Gmail Sync] ⏭️ Duplicate, skipping`);
                }
            } catch (error) {
                console.error(`[Gmail Sync] Error processing message:`, error);
                continue;
            }
        }

        return NextResponse.json({
            success: true,
            imported: importedApplications.length,
            applications: importedApplications,
            userEmail,
            message: `Sincronizado: ${importedApplications.length} nuevas aplicaciones encontradas.`
        });

    } catch (error) {
        console.error("Gmail Sync Error:", error);
        return NextResponse.json({ error: "Failed to sync emails" }, { status: 500 });
    }
}

// Extract email body from Gmail API payload
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            const errorText = await response.text();
            console.error("[Gmail Sync] Groq API error details:", {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                hasApiKey: !!groqApiKey,
                apiKeyPrefix: groqApiKey?.substring(0, 10) + '...'
            });
            throw new Error(`Groq API failed: ${response.status} - ${errorText}`);
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
