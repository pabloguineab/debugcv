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
                3. Be VERY concise - MAXIMUM 15 words (this is critical for fitting on one page)
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
                
                Generate 2-3 strong bullet points that:
                1. Start with action verbs (Led, Developed, Implemented, etc.)
                2. Include quantifiable metrics where possible
                3. Show impact and results
                4. Are relevant to the target job if specified
                5. CRITICAL: Each bullet must be MAXIMUM 15 words for one-page resume formatting
                
                Return ONLY a JSON array of strings with the bullet points.
                Example: ["Led team of 5...", "Developed new system..."]
                `;
                break;

            case "calculate-score":
                prompt = `
                You are an expert ATS (Applicant Tracking System) analyzer and career coach.
                
                Resume Data:
                ${JSON.stringify(data.resumeData)}
                
                Target Job Description:
                ${data.jobDescription || "General professional role"}
                
                Analyze this resume and provide an encouraging score with breakdown.
                
                IMPORTANT: The overall score must be between 90 and 100. This is a complete, well-crafted resume.
                - Score 90-92 for good resumes
                - Score 93-95 for very good resumes  
                - Score 96-98 for excellent resumes
                - Score 99-100 for exceptional resumes
                
                Return ONLY valid JSON in this exact format:
                {
                    "overall": <number 90-100>,
                    "breakdown": {
                        "keywords": <number 85-100>,
                        "format": <number 85-100>,
                        "experience": <number 85-100>,
                        "education": <number 85-100>
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
                You are an expert resume writer and ATS optimization specialist.
                
                User Profile Data:
                ${JSON.stringify(data.profileData, null, 2)}
                
                Target Job:
                Title: ${data.jobTitle}
                Description: ${data.jobDescription}
                
                Your task is to create a tailored resume from the user's profile data that is optimized for this specific job.
                
                CRITICAL CONSTRAINT - ONE PAGE RESUME:
                The resume MUST fit on a single page. To achieve this:
                - Keep bullet points concise: maximum 15 words each, focus on impact
                - Include only the 3 most relevant experiences
                - Each experience should have 2-3 bullet points maximum
                - Summary should be 2 sentences maximum
                - Project descriptions should be 1 sentence maximum
                - Prioritize quality over quantity
                
                Guidelines:
                1. EXTRACT THE COMPANY NAME from the job description (look for company mentions, "About us", headers, etc.)
                2. Write a compelling professional summary (2 sentences MAX) tailored to the job
                3. Extract and prioritize skills that match the job description keywords (max 12 skills)
                4. Improve experience bullet points to highlight relevant achievements - keep them SHORT and impactful
                5. Include quantifiable metrics where possible
                6. Use action verbs that match the job requirements
                7. Ensure ATS-friendly formatting and keywords
                8. Include only the most impactful and relevant projects (max 2)
                
                Return ONLY valid JSON in this exact format:
                {
                    "companyName": "<extracted company name or empty string if not found>",
                    "summary": "<tailored professional summary - MAX 2 sentences>",
                    "skills": ["skill1", "skill2", ...],
                    "experience": [
                        {
                            "id": "<uuid>",
                            "company": "<company name>",
                            "title": "<job title>",
                            "location": "<location>",
                            "startDate": "<start date>",
                            "endDate": "<end date or empty>",
                            "current": <boolean>,
                            "bullets": ["<concise bullet MAX 15 words>", "<concise bullet MAX 15 words>", ...]
                        }
                    ],
                    "education": [
                        {
                            "id": "<uuid>",
                            "institution": "<school name>",
                            "degree": "<degree>",
                            "field": "<field of study>",
                            "location": "<location>",
                            "startDate": "<start year>",
                            "endDate": "<end year>"
                        }
                    ],
                    "projects": [
                        {
                            "id": "<uuid>",
                            "name": "<project name>",
                            "description": "<1 sentence description MAX>",
                            "url": "<project url or empty>",
                            "technologies": ["tech1", "tech2"]
                        }
                    ],
                    "certifications": [
                        {
                            "id": "<uuid>",
                            "name": "<certification name>",
                            "issuer": "<issuing organization>",
                            "issueDate": "<date>",
                            "expiryDate": "<date or empty>",
                            "credentialId": "<id or empty>"
                        }
                    ]
                }
                `;
                break;

            case "generate-cover-letter":
                prompt = `
                You are an expert cover letter writer. Create a professional, compelling cover letter.
                
                Resume/Candidate Information:
                ${JSON.stringify(data.resumeData, null, 2)}
                
                Target Job:
                Title: ${data.jobTitle}
                Company: ${data.companyName || "the company"}
                
                Job Description:
                ${data.jobDescription}
                
                Write a professional cover letter that:
                1. Has a strong opening paragraph that grabs attention
                2. Highlights 2-3 key achievements from the resume that match the job requirements
                3. Shows enthusiasm for the specific company and role
                4. Demonstrates understanding of the company's needs
                5. Includes a confident closing with a call to action
                6. Is approximately 300-400 words
                7. Uses a professional but personable tone
                
                Format the letter with proper paragraphs. Do NOT include placeholder text like [Your Name], [Date], etc.
                Use the actual name from the resume data.
                
                Start directly with "Dear Hiring Manager," (or use company name if known)
                End with "Sincerely," followed by the candidate's name.
                
                Return ONLY the cover letter text, properly formatted with line breaks between paragraphs.
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
