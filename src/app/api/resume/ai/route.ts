import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, data } = body;

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        let prompt = "";
        let result;

        switch (action) {
            case "generate-summary":
                prompt = `
                You are an expert resume writer. Generate a professional summary for a job candidate.
                
                Candidate Information:
                - Name: ${data.fullName}
                - Target Job: ${data.targetJob || "Not specified"}
                - Skills: ${data.skills?.join(", ") || "Not specified"}
                - Experience: ${JSON.stringify(data.experience || [])}
                
                Job Description (if targeting specific job):
                ${data.jobDescription || "General resume"}
                
                Write a compelling 2-3 sentence professional summary that:
                1. Highlights key qualifications and years of experience
                2. Mentions relevant technical skills
                3. Shows value proposition
                4. Is tailored to the target job if specified
                
                Return ONLY the summary text, no quotes or formatting.
                `;
                break;

            case "improve-bullet":
                prompt = `
                You are an expert resume writer. Improve this resume bullet point to be more impactful.
                
                Original bullet: "${data.bullet}"
                Job context: ${data.jobTitle || "General"}
                Company: ${data.company || ""}
                
                Rewrite this bullet point to:
                1. Start with a strong action verb
                2. Include quantifiable results if possible
                3. Be concise (under 20 words)
                4. Focus on impact and achievements
                
                Return ONLY the improved bullet point, no quotes or formatting.
                `;
                break;

            case "generate-bullets":
                prompt = `
                You are an expert resume writer. Generate impactful resume bullet points.
                
                Role: ${data.jobTitle}
                Company: ${data.company}
                Target Job Description: ${data.jobDescription || "Not specified"}
                
                Generate 3-4 strong bullet points that:
                1. Start with action verbs (Led, Developed, Implemented, etc.)
                2. Include quantifiable metrics where possible
                3. Show impact and results
                4. Are relevant to the target job if specified
                
                Return ONLY a JSON array of strings with the bullet points.
                Example: ["Led team of 5...", "Developed new system..."]
                `;
                break;

            case "calculate-score":
                prompt = `
                You are an expert ATS (Applicant Tracking System) analyzer.
                
                Resume Data:
                ${JSON.stringify(data.resumeData)}
                
                Target Job Description:
                ${data.jobDescription || "General professional role"}
                
                Analyze this resume and provide a score with breakdown.
                
                Return ONLY valid JSON in this exact format:
                {
                    "overall": <number 0-100>,
                    "breakdown": {
                        "keywords": <number 0-100>,
                        "format": <number 0-100>,
                        "experience": <number 0-100>,
                        "education": <number 0-100>
                    },
                    "suggestions": [
                        "<specific improvement suggestion 1>",
                        "<specific improvement suggestion 2>",
                        "<specific improvement suggestion 3>"
                    ]
                }
                `;
                break;

            case "tailor-resume":
                prompt = `
                You are an expert resume writer. Tailor this resume content for a specific job.
                
                Current Resume:
                ${JSON.stringify(data.resumeData)}
                
                Target Job:
                Title: ${data.jobTitle}
                Description: ${data.jobDescription}
                
                Provide tailored versions of the summary and suggest which experiences to emphasize.
                
                Return ONLY valid JSON:
                {
                    "summary": "<tailored professional summary>",
                    "highlightedSkills": ["skill1", "skill2", ...],
                    "experienceOrder": ["exp_id_1", "exp_id_2", ...],
                    "suggestions": ["<tip1>", "<tip2>"]
                }
                `;
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean up markdown if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // For actions that expect JSON, parse it
        if (["generate-bullets", "calculate-score", "tailor-resume"].includes(action)) {
            try {
                const jsonResponse = JSON.parse(text);
                return NextResponse.json({ success: true, data: jsonResponse });
            } catch {
                return NextResponse.json({ success: true, data: text });
            }
        }

        return NextResponse.json({ success: true, data: text });

    } catch (error) {
        console.error("Resume AI error:", error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}
