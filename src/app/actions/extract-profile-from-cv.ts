'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Types matching the profile structure
export interface ExtractedProfile {
    overview: {
        bio: string;
        linkedin_user: string;
        github_user: string;
        location: string;
        full_name: string;
    };
    tech_stack: string[];
    experiences: {
        title: string;
        employment_type: string;
        company_name: string;
        country: string;
        start_month: string;
        start_year: string;
        end_month: string;
        end_year: string;
        is_current: boolean;
        description: string;
        skills: string[];
    }[];
    projects: {
        name: string;
        project_url: string;
        description: string;
        technologies: string[];
        start_month: string;
        start_year: string;
        end_month: string;
        end_year: string;
        is_ongoing: boolean;
    }[];
    educations: {
        school: string;
        school_url: string;
        degree: string;
        field_of_study: string;
        grade: string;
        activities: string;
        description: string;
        start_year: string;
        end_year: string;
        is_current: boolean;
    }[];
    certifications: {
        name: string;
        issuing_org: string;
        credential_id: string;
        credential_url: string;
        issue_month: string;
        issue_year: string;
        expiration_month: string;
        expiration_year: string;
        no_expiration: boolean;
        skills: string[];
    }[];
    languages: {
        language: string;
        level: string;
    }[];
}

export async function extractProfileFromCV(formData: FormData): Promise<ExtractedProfile | null> {
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
        const mimeType = file.type || 'application/pdf';

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

        const jsonSchema = {
            overview: {
                bio: "string - Professional summary/about me section. Leave empty string if not found.",
                linkedin_user: "string - LinkedIn username only (not full URL). Leave empty if not found.",
                github_user: "string - GitHub username only (not full URL). Leave empty if not found.",
                location: "string - Current city and country (e.g., 'Madrid, Spain'). Leave empty if not found.",
                full_name: "string - Full name of the candidate."
            },
            tech_stack: "array of strings - Technical skills, programming languages, frameworks, tools mentioned",
            experiences: [{
                title: "string - Job title",
                employment_type: "string - One of: Full-time, Part-time, Contract, Freelance, Internship, Self-employed",
                company_name: "string - Company name",
                country: "string - Country of the job",
                start_month: "string - Start month name (e.g., 'January')",
                start_year: "string - Start year (e.g., '2020')",
                end_month: "string - End month name, empty if current",
                end_year: "string - End year, empty if current",
                is_current: "boolean - true if this is current job",
                description: "string - Job description and responsibilities",
                skills: "array of strings - Skills used in this role"
            }],
            projects: [{
                name: "string - Project name",
                project_url: "string - Project URL if available, empty if not",
                description: "string - Project description",
                technologies: "array of strings - Technologies used",
                start_month: "string - Start month, empty if not available",
                start_year: "string - Start year, empty if not available",
                end_month: "string - End month, empty if ongoing or not available",
                end_year: "string - End year, empty if ongoing or not available",
                is_ongoing: "boolean - true if project is ongoing"
            }],
            educations: [{
                school: "string - School/University name",
                school_url: "string - School website URL, empty if not found",
                degree: "string - Degree type (e.g., Bachelor's, Master's, PhD)",
                field_of_study: "string - Field of study/major",
                grade: "string - GPA or grade, empty if not mentioned",
                activities: "string - Extracurricular activities, empty if not mentioned",
                description: "string - Additional description, empty if not available",
                start_year: "string - Start year",
                end_year: "string - End year, empty if currently studying",
                is_current: "boolean - true if currently studying"
            }],
            certifications: [{
                name: "string - Certification name",
                issuing_org: "string - Issuing organization",
                credential_id: "string - Credential ID if available, empty if not",
                credential_url: "string - Credential verification URL if available, empty if not",
                issue_month: "string - Issue month",
                issue_year: "string - Issue year",
                expiration_month: "string - Expiration month, empty if no expiration",
                expiration_year: "string - Expiration year, empty if no expiration",
                no_expiration: "boolean - true if certification does not expire",
                skills: "array of strings - Skills related to this certification"
            }],
            languages: [{
                language: "string - Language name (e.g., 'English', 'Spanish')",
                level: "string - One of: native, fluent, advanced, intermediate, basic"
            }]
        };

        const prompt = `
You are an expert CV/Resume parser. Extract ALL information from the provided CV document and map it to the JSON structure below.

IMPORTANT RULES:
1. ONLY extract information that is EXPLICITLY stated in the CV. DO NOT invent or assume any data.
2. If a field is not found in the CV, use an empty string "" for text fields, empty array [] for arrays, or false for booleans.
3. For tech_stack, extract ALL technical skills, programming languages, frameworks, databases, tools, and technologies mentioned anywhere in the CV.
4. For experiences, extract ALL work experiences in chronological order (most recent first).
5. For employment_type, infer from context if not explicit (full-time is default for regular jobs).
6. For months, use full month names (e.g., "January", "February").
7. For linkedin_user and github_user, extract ONLY the username, not the full URL.
8. Be thorough - capture every piece of information from the CV.

Expected JSON structure:
${JSON.stringify(jsonSchema, null, 2)}

Return ONLY valid JSON matching this structure. No explanations, no markdown formatting.
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

        // Clean markdown if Gemini adds it
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(text);
        return data as ExtractedProfile;

    } catch (error) {
        console.error("Error in extractProfileFromCV:", error);
        return null;
    }
}
