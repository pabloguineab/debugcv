import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// @ts-ignore
// Removed pdf-parse dependency

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const jobDescription = formData.get("jobDescription") as string | null;
        const jobTitle = formData.get("jobTitle") as string | null;

        if (!file || !jobDescription) {
            return NextResponse.json(
                { error: "Missing file or job description" },
                { status: 400 }
            );
        }

        // Convert File to Base64 for Gemini
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");

        // Prepare prompt for Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
        Act as an expert ATS (Applicant Tracking System) and Resume Coach.
        Analyze the attached Resume PDF against the provided Job Description.
        
        Job Title: ${jobTitle || "Not specified"}
        Job Description:
        "${jobDescription.substring(0, 5000)}"

        Provide a detailed analysis in strictly VALID JSON format (no markdown, no backticks) with the following specific structure:
        {
            "score": <number between 0-100 representing match percentage>,
            "summary": "<concise summary of the match, highlighting key strengths and major gaps, max 3 sentences>",
            "critical_errors": [
                "<list of critical missing keywords, skills, or format issues that would cause rejection>"
            ],
            "improvements": [
                "<list of actionable improvements to increase the score, be specific about what to add or change>"
            ]
        }

        1. Be strict but creating.
        2. Focus on keyword matching (skills, tools, certifications).
        3. All output MUST be in English.
        4. Start the summary with "Compatibility analysis for [Job Title]:"
        5. If the resume is completely irrelevant, give a low score (<40).
        6. Return ONLY the JSON string.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type || "application/pdf",
                },
            },
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up markdown if Gemini adds it
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const jsonResponse = JSON.parse(text);

        return NextResponse.json(jsonResponse);

    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: "Internal server error during analysis" },
            { status: 500 }
        );
    }
}
