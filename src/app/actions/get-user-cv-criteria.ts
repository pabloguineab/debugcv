'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

        // Fetch real profile data from Supabase
        // We import dynamically to avoid circular dependencies if any, 
        // though typically importing server actions is fine.
        const { fetchFullProfile } = await import("@/lib/actions/profile");
        const fullProfile = await fetchFullProfile();

        if (!fullProfile || !fullProfile.profile) {
            console.log("No profile found for user:", session.user.email);
            return null;
        }

        const { profile, experiences, educations, projects, certifications } = fullProfile;

        // Construct a text representation of the profile for the AI
        let contextText = `
            PROFILE:
            Name: ${profile.full_name || "Unknown"}
            Bio: ${profile.bio || ""}
            Location: ${profile.location || ""}
            Tech Stack: ${profile.tech_stack?.join(", ") || ""}
        `;

        if (experiences && experiences.length > 0) {
            contextText += `\n\nEXPERIENCE:\n`;
            experiences.forEach((exp: any) => {
                contextText += `- ${exp.title} at ${exp.company_name} (${exp.start_year}-${exp.is_current ? 'Present' : exp.end_year}): ${exp.description}\n`;
            });
        }

        if (projects && projects.length > 0) {
            contextText += `\n\nPROJECTS:\n`;
            projects.forEach((proj: any) => {
                contextText += `- ${proj.name}: ${proj.description} (Tech: ${proj.technologies?.join(", ")})\n`;
            });
        }

        if (educations && educations.length > 0) {
            contextText += `\n\nEDUCATION:\n`;
            educations.forEach((edu: any) => {
                contextText += `- ${edu.degree} in ${edu.field_of_study} at ${edu.school}\n`;
            });
        }

        if (certifications && certifications.length > 0) {
            contextText += `\n\nCERTIFICATIONS:\n`;
            certifications.forEach((cert: any) => {
                contextText += `- ${cert.name} from ${cert.issuing_org}\n`;
            });
        }

        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY missing");
            return null;
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Using 'gemini-3-flash-preview' model as requested, matching ATS route configuration and other files.
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });


        const prompt = `
            You are an expert Job Search Assistant.
            Analyze the following USER PROFILE to create EFFECTIVE, BROAD search queries for finding relevant jobs on major job boards (Indeed, LinkedIn, Google Jobs).
            
            Extract:
            1. "role": The SIMPLEST, most common job title that matches the candidate (e.g. "Software Engineer", "Data Scientist", "Product Manager").
            2. "skills": Top 3-5 most relevant technical skills.
            3. "location": The candidate's CURRENT residency (City, Country). If not explicitly stated, infer from most recent experience location.
            4. "level": Seniority level (Junior, Mid, Senior, Staff, Lead).

            Construct 5 distinct "search_queries" - use STANDARD JOB TITLES ONLY.
            
            CRITICAL RULES:
            - DO NOT include specific technologies, libraries or frameworks in the query (e.g. NEVER use "LangChain", "RAG", "React", "Python" in the query string).
            - ONLY use standard Job Titles (e.g. "Machine Learning Engineer", "Software Developer", "Data Analyst").
            - Format: "[Level] [Standard Role] in [City]"
            
            Queries to generate:
            1. Primary: "[Level] [Standard Role] in [City]" (e.g. "Senior Machine Learning Engineer in Madrid")
            2. General: "[Standard Role] in [City]" (e.g. "Machine Learning Engineer in Madrid")
            3. Broader Synonym: "[Alternative Standard Role] in [City]" (e.g. "AI Engineer in Madrid" or "Data Scientist in Madrid")
            4. Simplest: "[Role Noun] in [City]" (e.g. "Developer in Madrid" or "Engineer in Madrid")
            5. Remote: "[Level] [Standard Role] Remote"
            
            USER PROFILE CONTEXT:
            ${contextText.substring(0, 15000)}

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
        return null;
    }
}
