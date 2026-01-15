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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated to a stable model name if possible, or fallback

        const prompt = `
            You are an expert Job Search Assistant.
            Analyze the following USER PROFILE to create the BEST search queries for finding a relevant job.
            
            Extract:
            1. "role": The most accurate job title based on their experience and bio (e.g. "Senior Frontend Developer").
            2. "skills": Top 3-5 most relevant technical skills from their stack and experience.
            3. "location": The candidate's CURRENT residency (City, Country). If not explicitly stated, infer from most recent experience location.
            4. "level": Seniority level (Junior, Mid, Senior, Staff, Lead).

            Construct 2 distinct "search_queries":
            1. Broad/Standard: Role + Location (e.g. "Machine Learning Engineer in Toronto")
            2. Specific/Niche: Role + Top Skill (e.g. "Machine Learning Engineer Python")
            
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
