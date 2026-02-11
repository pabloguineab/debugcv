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
            Analyze the provided CV document to create EFFECTIVE, BROAD search queries for finding relevant jobs on major job boards (Indeed, LinkedIn, Google Jobs).
            
            Extract:
            1. "role": The SIMPLEST, most common job title that matches the candidate (e.g. "Software Engineer", "Data Scientist", "Product Manager").
            2. "skills": Top 3-5 most relevant technical skills.
            3. "location": The candidate's CURRENT residency (City, Country). STRICTLY infer from the Header/Contact section (e.g., "Madrid, Spain" near name/email).
            4. "level": Seniority level (Junior, Mid, Senior, Staff, Lead).

            Construct 5 distinct "search_queries" - use STANDARD JOB TITLES ONLY.
            
            CRITICAL RULES:
            - DO NOT include specific technologies or frameworks in the query (e.g. NEVER use "LangChain", "RAG", "React", "Python" in the query string).
            - ONLY use standard Job Titles (e.g. "Machine Learning Engineer", "Software Developer", "Data Analyst").
            - Format: "[Level] [Standard Role] in [City]"
            
            Queries to generate:
            1. Primary: "[Level] [Standard Role] in [City]" (e.g. "Senior Machine Learning Engineer in Madrid")
            2. General: "[Standard Role] in [City]" (e.g. "Machine Learning Engineer in Madrid")
            3. Broader Synonym: "[Alternative Standard Role] in [City]" (e.g. "AI Engineer in Madrid" or "Data Scientist in Madrid")
            4. Simplest: "[Role Noun] in [City]" (e.g. "Developer in Madrid" or "Engineer in Madrid")
            5. Remote: "[Level] [Standard Role] Remote"
            
            Example of BAD query: "NLP Engineer LangChain RAG" (Too specific, returns 0 results)
            Example of GOOD query: "Machine Learning Engineer" (Standard, returns many results)

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
