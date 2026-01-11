'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/lib/kv-db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export interface CVCriteria {
    role: string;
    skills: string[];
    location: string | null;
    level: string;
    search_queries: string[];
}

export async function getUserCvCriteria(): Promise<CVCriteria | null> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            console.log("No session found in getUserCvCriteria");
            return null;
        }

        const profile = await getUserProfile(session.user.email);

        if (!profile || !profile.cv_text) {
            console.log("No profile or cv_text found for user:", session.user.email);
            return null;
        }

        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY missing");
            return null;
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Use a standard stable model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert Job Search Assistant.
            Analyze the following CV text to create the BEST search queries for finding a relevant job.
            
            Extract:
            1. "role": The most accurate job title (e.g. "Senior Frontend Developer").
            2. "skills": Top 3-5 most relevant technical skills.
            3. "location": The candidate's CURRENT residency (City, Country). STRICTLY infer from the Header/Contact section (e.g., "Madrid, Spain" near name/email) or current job location. Do NOT use Education location.
            4. "level": Seniority level (Junior, Mid, Senior, Staff, Lead).

            Construct 2 distinct "search_queries":
            1. Broad/Standard: Role + Location (e.g. "Machine Learning Engineer in Toronto")
            2. Specific/Niche: Role + Top Skill (e.g. "Machine Learning Engineer Python")
            
            CV TEXT:
            ${profile.cv_text.substring(0, 10000)}

            Return JSON ONLY:
            {
                "role": "string",
                "skills": ["string"],
                "location": "string" | null,
                "level": "string",
                "search_queries": ["string"] 
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean markdown
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(text);
        return data as CVCriteria;

    } catch (error) {
        console.error("Error in getUserCvCriteria:", error);
        return null; // Fail gracefully
    }
}
