import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API Key from env
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function POST(req: Request) {
    try {
        const { friendEmail, referrerName, referralLink } = await req.json();

        if (!friendEmail || !referrerName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate a unique referral code for tracking (optional)
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Professional email HTML template
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You've Been Invited to DebugCV!</title>
            <style>
                body { 
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                    background-color: #f8fafc; 
                    color: #1e293b; 
                    margin: 0; 
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }
                .wrapper {
                    background-color: #f8fafc;
                    padding: 40px 20px;
                }
                .container { 
                    max-width: 560px; 
                    margin: 0 auto; 
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%);
                    padding: 32px 40px;
                    text-align: center;
                }
                .logo { 
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    margin: 0;
                }
                .logo-accent {
                    color: #93c5fd;
                }
                .content {
                    padding: 40px;
                }
                .gift-badge {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-size: 14px;
                    font-weight: 600;
                    display: inline-block;
                    margin-bottom: 24px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .heading {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 16px 0;
                    line-height: 1.3;
                }
                .referrer-name {
                    color: #2563EB;
                    font-weight: 700;
                }
                .message {
                    font-size: 16px;
                    color: #475569;
                    line-height: 1.6;
                    margin: 0 0 24px 0;
                }
                .discount-box {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border: 2px dashed #2563EB;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin: 24px 0;
                }
                .discount-label {
                    font-size: 14px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 8px 0;
                }
                .discount-value {
                    font-size: 48px;
                    font-weight: 800;
                    color: #2563EB;
                    margin: 0;
                    line-height: 1;
                }
                .discount-text {
                    font-size: 16px;
                    color: #1e293b;
                    margin: 8px 0 0 0;
                    font-weight: 600;
                }
                .cta-button { 
                    background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%);
                    color: white !important; 
                    padding: 16px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: 600; 
                    font-size: 16px;
                    display: inline-block;
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
                    transition: all 0.2s ease;
                }
                .cta-container {
                    text-align: center;
                    margin: 32px 0;
                }
                .features {
                    background-color: #f8fafc;
                    border-radius: 8px;
                    padding: 24px;
                    margin: 24px 0;
                }
                .features-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 16px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }
                .feature-icon {
                    color: #22c55e;
                    font-size: 16px;
                    margin-right: 12px;
                    font-weight: bold;
                }
                .feature-text {
                    font-size: 14px;
                    color: #475569;
                    margin: 0;
                    line-height: 1.5;
                }
                .divider {
                    height: 1px;
                    background-color: #e2e8f0;
                    margin: 32px 0;
                }
                .footer { 
                    text-align: center;
                    padding: 24px 40px;
                    background-color: #f8fafc;
                }
                .footer-text {
                    font-size: 12px; 
                    color: #94a3b8;
                    margin: 0;
                    line-height: 1.6;
                }
                .footer-link {
                    color: #2563EB;
                    text-decoration: none;
                }
                .social-links {
                    margin-top: 16px;
                }
                .social-link {
                    color: #64748b;
                    text-decoration: none;
                    font-size: 12px;
                    margin: 0 8px;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <!-- Header with Logo -->
                    <div class="header">
                        <h1 class="logo">Debug<span class="logo-accent">CV</span></h1>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="content">
                        <div style="text-align: center;">
                            <span class="gift-badge">🎁 Special Invitation</span>
                        </div>
                        
                        <h2 class="heading">
                            <span class="referrer-name">${referrerName}</span> thinks you should try DebugCV!
                        </h2>
                        
                        <p class="message">
                            Your friend ${referrerName.split(' ')[0]} has been using DebugCV to supercharge their career and wants to share the experience with you. As a welcome gift, you'll receive an exclusive discount!
                        </p>
                        
                        <!-- Discount Box -->
                        <div class="discount-box">
                            <p class="discount-label">Your Exclusive Discount</p>
                            <p class="discount-value">30% OFF</p>
                            <p class="discount-text">on any premium plan</p>
                        </div>
                        
                        <!-- CTA Button -->
                        <div class="cta-container">
                            <a href="${referralLink || 'https://app.debugcv.com/auth/signup'}?ref=${referralCode}" class="cta-button">
                                Claim Your Discount →
                            </a>
                        </div>
                        
                        <!-- Features -->
                        <div class="features">
                            <p class="features-title">What you'll get with DebugCV:</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="top" style="padding: 6px 0;">
                                        <span style="color: #22c55e; font-weight: bold; margin-right: 8px;">✓</span>
                                        <span style="font-size: 14px; color: #475569;">AI-powered resume optimization</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 6px 0;">
                                        <span style="color: #22c55e; font-weight: bold; margin-right: 8px;">✓</span>
                                        <span style="font-size: 14px; color: #475569;">ATS-friendly resume analysis</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 6px 0;">
                                        <span style="color: #22c55e; font-weight: bold; margin-right: 8px;">✓</span>
                                        <span style="font-size: 14px; color: #475569;">AI interview coach & preparation</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 6px 0;">
                                        <span style="color: #22c55e; font-weight: bold; margin-right: 8px;">✓</span>
                                        <span style="font-size: 14px; color: #475569;">Personalized cover letter generation</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 6px 0;">
                                        <span style="color: #22c55e; font-weight: bold; margin-right: 8px;">✓</span>
                                        <span style="font-size: 14px; color: #475569;">Job application tracking</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 14px; color: #64748b; text-align: center; margin: 0;">
                            This offer is exclusive for friends of DebugCV users.<br>
                            Use code <strong style="color: #2563EB;">${referralCode}</strong> at checkout.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p class="footer-text">
                            You received this email because ${referrerName} invited you to try DebugCV.<br>
                            <a href="https://debugcv.com" class="footer-link">www.debugcv.com</a>
                        </p>
                        <div class="social-links">
                            <a href="https://twitter.com/debugcv" class="social-link">Twitter</a>
                            <span style="color: #cbd5e1;">•</span>
                            <a href="https://linkedin.com/company/debugcv" class="social-link">LinkedIn</a>
                        </div>
                        <p class="footer-text" style="margin-top: 16px;">
                            © ${new Date().getFullYear()} DebugCV. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'DebugCV <info@debugcv.com>',
                to: friendEmail,
                subject: `🎁 ${referrerName} invites you to DebugCV - Get 30% OFF!`,
                html: htmlContent,
            });
            return NextResponse.json({
                success: true,
                message: "Invitation sent successfully",
                referralCode
            });
        } else {
            console.log("No RESEND_API_KEY found. Mocking email send.");
            console.log("Would send to:", friendEmail);
            console.log("From:", referrerName);
            // Return success even if mocked
            return NextResponse.json({
                success: true,
                message: "Mock invitation sent (check console)",
                referralCode
            });
        }

    } catch (error) {
        console.error("Error sending referral invite:", error);
        return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
    }
}
