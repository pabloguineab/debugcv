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
            Analyze the provided CV document to create EFFECTIVE search queries for finding relevant jobs.
            
            Extract:
            1. "role": The SIMPLEST, most common job title that matches the candidate (e.g. "Software Engineer", "Data Scientist", "Product Manager"). Avoid overly specific titles.
            2. "skills": Top 3-5 most relevant technical skills.
            3. "location": The candidate's CURRENT residency (City, Country). STRICTLY infer from the Header/Contact section (e.g., "Madrid, Spain" near name/email) or current job location. Do NOT use Education location.
            4. "level": Seniority level (Junior, Mid, Senior, Staff, Lead).

            Construct 5 distinct "search_queries" - use SIMPLE, COMMON job titles that job boards recognize:
            1. Base query: "[Level] [Simple Role] in [City]" (e.g. "Senior Software Engineer in Madrid")
            2. Broader: "[Simple Role] in [City]" without level (e.g. "Software Engineer in Madrid")
            3. Alternative title: Use a synonym/alternative common title (e.g. "Developer" instead of "Engineer", "Data Analyst" instead of "Data Scientist")
            4. Industry specific: "[Role] [Industry/Domain]" if applicable (e.g. "Backend Developer Fintech")
            5. Remote option: "[Level] [Role] Remote"
            
            IMPORTANT: 
            - Use SIMPLE, COMMON job titles that return many results (avoid niche terms like "LangChain", "RAG", specific frameworks)
            - Keep queries SHORT (2-4 words + location)
            - Focus on roles that exist on job boards, not cutting-edge titles
            
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
