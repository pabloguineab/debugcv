'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { type CVCriteria } from "./get-user-cv-criteria";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export async function analyzeCvFile(formData: FormData): Promise<CVCriteria | null> {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            console.error("No file provided");
            return null;
        }

        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY missing");
            return null;
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");
        // Ensure mimeType is supported. Gemini supports pdf, text, png, jpeg.
        // If it's a docx, we usually need text extraction, but let's hope it's PDF or try generic text/plain if fails? 
        // Gemini 1.5 might struggle with raw docx binary, but let's assume PDF for now as primary, or we can fallback to text extraction logic if needed later.
        // For this iteration, we pass it directly.
        const mimeType = file.type || 'application/pdf';

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Using 'gemini-3-flash-preview' model as requested, matching ATS route configuration.
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
            You are an expert Job Search Assistant.
            Analyze the provided CV document to create the BEST search queries for finding a relevant job.
            
            Extract:
            1. "role": The most accurate job title (e.g. "Senior Frontend Developer").
            2. "skills": Top 3-5 most relevant technical skills.
            3. "location": The candidate's CURRENT residency (City, Country). STRICTLY infer from the Header/Contact section (e.g., "Madrid, Spain" near name/email) or current job location. Do NOT use Education location.
            4. "level": Seniority level (Junior, Mid, Senior, Staff, Lead).

            Construct 2 distinct "search_queries":
            1. Broad/Standard: Role + Location (e.g. "Machine Learning Engineer in Toronto")
            2. Specific/Niche: Role + Top Skill (e.g. "Machine Learning Engineer Python")
            
            Return JSON ONLY:
            {
                "role": "string",
                "skills": ["string"],
                "location": "string" | null,
                "level": "string",
                "search_queries": ["string"] 
            }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean markdown
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(text);
        return data as CVCriteria;

    } catch (error) {
        console.error("Error in analyzeCvFile:", error);
        return null;
    }
}
