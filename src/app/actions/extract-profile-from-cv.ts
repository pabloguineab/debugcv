'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Types matching the profile structure
export interface ExtractedProfile {
    // Validation fields
    document_type: 'resume' | 'other';
    industry: 'tech' | 'healthcare' | 'legal' | 'business' | 'education' | 'other';
    
    overview: {
        bio: string;
        linkedin_user: string;
        github_user: string;
        location: string;
        full_name: string;
        phone_number: string;
    };
    tech_stack: string[];
    experiences: {
        title: string;
        employment_type: string;
        company_name: string;
        company_url: string;
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

// Error types for import validation
export type ImportError = 
    | 'NOT_A_RESUME'
    | 'NOT_TECH_RESUME'
    | 'EXTRACTION_FAILED'
    | null;

export interface ExtractResult {
    success: boolean;
    data: ExtractedProfile | null;
    error: ImportError;
    errorMessage?: string;
}

export async function extractProfileFromCV(formData: FormData): Promise<ExtractResult> {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            console.error("No file provided");
            return { success: false, data: null, error: 'EXTRACTION_FAILED', errorMessage: 'No file provided' };
        }

        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY missing");
            return { success: false, data: null, error: 'EXTRACTION_FAILED', errorMessage: 'API key missing' };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");
        const mimeType = file.type || 'application/pdf';

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const jsonSchema = {
            document_type: "string - REQUIRED: Analyze if this is a resume/CV or some other type of document. Must be exactly one of: 'resume' or 'other'. A resume/CV contains work experience, education, skills. If it's a letter, invoice, article, form, or any other non-CV document, set to 'other'.",
            industry: "string - REQUIRED: Identify the primary industry/field of the candidate based on their experience and skills. Must be exactly one of: 'tech', 'healthcare', 'legal', 'business', 'education', 'other'. Tech includes: software development, IT, data science, cybersecurity, DevOps, cloud engineering, QA, UX/UI design for digital products. Healthcare includes: nurses, doctors, medical. Legal includes: lawyers, paralegals. Business includes: marketing (non-digital), sales, HR, finance, consulting. Education includes: teachers, professors.",
            overview: {
                bio: "string - IMPORTANT: Extract the Professional Summary, Profile, About Me, or Career Objective section from the CV. This is typically a 2-4 sentence paragraph at the top describing the candidate's experience and goals. If found, include the full text. Leave empty string ONLY if no such section exists.",
                linkedin_user: "string - LinkedIn username only (not full URL). Leave empty if not found.",
                github_user: "string - GitHub username only (not full URL). Leave empty if not found.",
                location: "string - Current city and country (e.g., 'Madrid, Spain'). Leave empty if not found.",
                full_name: "string - Full name of the candidate.",
                phone_number: "string - Phone number with country code if available (e.g., '+34 612345678', '+1 555-123-4567'). Extract exactly as written in CV. Leave empty if not found."
            },
            tech_stack: "array of strings - Technical skills, programming languages, frameworks, tools mentioned",
            experiences: [{
                title: "string - Job title",
                employment_type: "string - One of: Full-time, Part-time, Contract, Freelance, Internship, Self-employed",
                company_name: "string - Company name",
                company_url: "string - Company website URL. If explicitly in CV, use it. Otherwise, infer the most likely official website (e.g., 'Google' -> 'https://www.google.com', 'Microsoft' -> 'https://www.microsoft.com'). For well-known companies, provide the official URL. If unknown small company, leave empty.",
                country: "string - Country of the job",
                start_month: "string - Start month name (e.g., 'January')",
                start_year: "string - Start year (e.g., '2020')",
                end_month: "string - End month name, empty if current",
                end_year: "string - End year, empty if current",
                is_current: "boolean - true if this is current job",
                description: "string - Job description formatted as BULLET POINTS. Each bullet point should start on a new line. If the original text is a paragraph, break it into logical bullet points (one responsibility/achievement per line). Format: 'First achievement or responsibility\\nSecond achievement or responsibility\\nThird achievement or responsibility'. Use \\n as separator between bullets. Do NOT include bullet symbols like • or -, just the text separated by newlines.",
                skills: "array of strings - Skills used in this role"
            }],
            projects: [{
                name: "string - Project name",
                project_url: "string - Project URL if available, empty if not",
                description: "string - Project description formatted as BULLET POINTS. Each key feature or achievement should be on a new line. Use \\n as separator between bullets. Do NOT include bullet symbols like • or -, just the text separated by newlines.",
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
You are an expert document analyzer and CV/Resume parser. First, analyze the document to determine:
1. Is this a resume/CV or some other type of document?
2. If it's a resume, what industry/field is the candidate in?

Then, extract ALL information and map it to the JSON structure below.

CRITICAL FIRST STEP - DOCUMENT CLASSIFICATION:
- document_type: Set to "resume" ONLY if this is clearly a CV/resume with work experience, education, and skills. Set to "other" for letters, invoices, articles, forms, contracts, or any non-CV document.
- industry: Based on the candidate's experience and skills, classify as:
  * "tech" - software engineers, developers, data scientists, DevOps, cloud engineers, IT professionals, QA engineers, UX/UI designers (for digital products), cybersecurity
  * "healthcare" - nurses, doctors, medical professionals, pharmacists, therapists
  * "legal" - lawyers, paralegals, legal assistants
  * "business" - marketing, sales, HR, finance, consulting, management (non-tech)
  * "education" - teachers, professors, academic staff
  * "other" - any other field not listed above

EXTRACTION RULES (only if document is a resume):
1. ONLY extract information that is EXPLICITLY stated in the CV. DO NOT invent or assume any data.
2. If a field is not found in the CV, use an empty string "" for text fields, empty array [] for arrays, or false for booleans.
3. For tech_stack, extract ALL technical skills, programming languages, frameworks, databases, tools, and technologies mentioned anywhere in the CV.
4. For experiences, extract ALL work experiences in chronological order (most recent first).
5. For employment_type, infer from context if not explicit (full-time is default for regular jobs).
6. For months, use full month names (e.g., "January", "February").
7. For linkedin_user and github_user, extract ONLY the username, not the full URL.
8. For company_url in experiences: If URL is in the CV, use it. If not, but it's a well-known company (Google, Microsoft, Amazon, Meta, Apple, etc.), provide the official website URL. For unknown companies, leave empty.
9. CRITICAL - For experience AND project descriptions: Format as BULLET POINTS separated by newlines (\\n). Break long paragraphs into separate achievements/responsibilities/features. Each line = one bullet point. Do NOT use bullet symbols (•, -, *), just text separated by \\n.
10. CRITICAL - For overview.bio: Look for sections labeled "Summary", "Professional Summary", "Profile", "About Me", "Career Objective", or similar at the TOP of the resume. Extract the FULL TEXT of this section. This is essential - do NOT leave empty if such a section exists.
11. Be thorough - capture every piece of information from the CV.

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

        const data = JSON.parse(text) as ExtractedProfile;
        
        // Validate document type
        if (data.document_type !== 'resume') {
            return {
                success: false,
                data: null,
                error: 'NOT_A_RESUME',
                errorMessage: 'The uploaded file does not appear to be a resume/CV. Please upload your resume.'
            };
        }
        
        // Validate industry
        if (data.industry !== 'tech') {
            const industryNames: Record<string, string> = {
                healthcare: 'Healthcare',
                legal: 'Legal',
                business: 'Business',
                education: 'Education',
                other: 'another field'
            };
            const industryName = industryNames[data.industry] || 'another field';
            return {
                success: false,
                data: null,
                error: 'NOT_TECH_RESUME',
                errorMessage: `It looks like your resume is from ${industryName}. DebugCV currently only optimizes Tech resumes (Software Engineering, Data Science, DevOps, etc.). We're working on expanding to other industries soon!`
            };
        }
        
        return { success: true, data, error: null };

    } catch (error) {
        console.error("Error in extractProfileFromCV:", error);
        return { success: false, data: null, error: 'EXTRACTION_FAILED', errorMessage: 'An error occurred while processing the document.' };
    }
}
