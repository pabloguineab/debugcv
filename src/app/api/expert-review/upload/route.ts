
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'DebugCV Leads <leads@debugcv.com>'; // Fallback to verified domain
const TO_EMAIL = 'info@debugcv.com';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const acceptedTerms = formData.get("terms") === "true";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!acceptedTerms) {
            return NextResponse.json({ error: "Terms not accepted" }, { status: 400 });
        }

        if (!RESEND_API_KEY) {
            console.error("Missing RESEND_API_KEY");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const resend = new Resend(RESEND_API_KEY);

        const userName = session.user.name || "Unknown User";
        const userEmail = session.user.email || "No Email";

        // HTML Email Template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #000000 0%, #333333 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                    .field { margin-bottom: 20px; }
                    .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                    .value { font-size: 16px; color: #1e293b; font-weight: 500; }
                    .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
                    .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Expert Review Request</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.8;">New CV submission for expert review</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <span class="badge">New Lead</span>
                        </div>
                        <div class="field">
                            <div class="label">User Name</div>
                            <div class="value">${userName}</div>
                        </div>
                        <div class="field">
                            <div class="label">User Email</div>
                            <div class="value"><a href="mailto:${userEmail}" style="color: #2563eb; text-decoration: none;">${userEmail}</a></div>
                        </div>
                        <div class="field">
                            <div class="label">Attached File</div>
                            <div class="value">📎 ${file.name}</div>
                        </div>
                        <div class="field">
                            <div class="label">File Size</div>
                            <div class="value">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <div class="field">
                            <div class="label">Submission Date</div>
                            <div class="value">${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Sent via DebugCV Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [TO_EMAIL],
            subject: `🎯 Expert Review: ${userName}`,
            html: htmlContent,
            attachments: [
                {
                    filename: file.name,
                    content: buffer,
                },
            ],
            replyTo: userEmail,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data?.id });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
