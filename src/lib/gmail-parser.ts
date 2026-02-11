import { google } from "googleapis";

interface JobApplication {
    job_title: string;
    company_name: string;
    platform: string;
    applied_at: string; // ISO Date
    job_url?: string;
    status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
}

const PLATFORMS = {
    LINKEDIN: 'LinkedIn',
    INDEED: 'Indeed',
    INFOJOBS: 'InfoJobs',
    GLASSDOOR: 'Glassdoor',
    WELLFOUND: 'Wellfound',
    OTTA: 'Otta'
};

// Common patterns for Subject Lines across languages (EN, ES, FR, IT)
// We look for patterns like: "Application sent to Google", "Solicitud enviada a Amazon", etc.
const SUBJECT_PATTERNS = [
    // LinkedIn
    { platform: PLATFORMS.LINKEDIN, regex: /Application sent to (.+)/i, lang: 'en', companyIndex: 1 },
    { platform: PLATFORMS.LINKEDIN, regex: /Solicitud enviada a (.+)/i, lang: 'es', companyIndex: 1 },
    { platform: PLATFORMS.LINKEDIN, regex: /Candidature envoyée à (.+)/i, lang: 'fr', companyIndex: 1 },
    { platform: PLATFORMS.LINKEDIN, regex: /Candidatura inviata a (.+)/i, lang: 'it', companyIndex: 1 },
    { platform: PLATFORMS.LINKEDIN, regex: /You applied to (.+)/i, lang: 'en', companyIndex: 1 },

    // Indeed
    { platform: PLATFORMS.INDEED, regex: /Indeed Application: (.+)/i, lang: 'en', companyIndex: 1 },
    { platform: PLATFORMS.INDEED, regex: /Candidatura en Indeed: (.+)/i, lang: 'es', companyIndex: 1 },
    { platform: PLATFORMS.INDEED, regex: /Apply: (.+)/i, lang: 'en', companyIndex: 1 }, // Generic Indeed pattern

    // InfoJobs (Complex subject often includes job title)
    { platform: PLATFORMS.INFOJOBS, regex: /Te has inscrito en la oferta (.+)/i, lang: 'es', companyIndex: 1 },

    // Glassdoor
    { platform: PLATFORMS.GLASSDOOR, regex: /You applied for (.+)/i, lang: 'en', companyIndex: 1 },
];

/**
 * Extract job details from a Gmail Message
 */
export async function parseJobApplicationEmail(message: any, gmailClient: any): Promise<JobApplication | null> {
    try {
        const headers = message.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const date = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();

        // 1. Identify Platform based on Sender or Subject
        let platform = 'Email';

        if (from.includes('linkedin.com') || subject.includes('LinkedIn')) platform = PLATFORMS.LINKEDIN;
        else if (from.includes('indeed.com') || subject.includes('Indeed')) platform = PLATFORMS.INDEED;
        else if (from.includes('infojobs.net') || subject.includes('InfoJobs')) platform = PLATFORMS.INFOJOBS;
        else if (from.includes('glassdoor.com')) platform = PLATFORMS.GLASSDOOR;
        else if (from.includes('wellfound.com') || from.includes('angel.co')) platform = PLATFORMS.WELLFOUND;
        else if (from.includes('otta.com')) platform = PLATFORMS.OTTA;
        else {
            // If not from a known major platform, skip for now to avoid junk
            // Or trigger AI parsing if we want to be very smart (costly)
            return null;
        }

        // 2. Extract Company Name & Job Title
        // Use regex on Subject first (most reliable for transactional emails)
        let company_name = '';
        let job_title = 'Job Application'; // Default

        // Attempt pattern matching on Subject
        for (const pattern of SUBJECT_PATTERNS) {
            if (pattern.platform === platform) {
                const match = subject.match(pattern.regex);
                if (match && match[pattern.companyIndex]) {
                    // Start by assuming the captured group is the Company
                    // LinkedIn subjects often are "Application sent to Google" -> Company = Google
                    company_name = match[pattern.companyIndex].trim();
                    break;
                }
            }
        }

        // If Regex failed, fetch the snippet/body to find content
        if (!company_name) {
            // Fallback: If From is "LinkedIn Jobs", maybe Subject is just the Job Title?
            // Heuristic: "Senior AI Engineer at Google"
            const atMatch = subject.match(/(.+) (at|@|en|chez|presso) (.+)/i);
            if (atMatch) {
                job_title = atMatch[1].trim();
                company_name = atMatch[3].trim();
            } else {
                // Fallback 2: Snippet usually contains "You applied to [Company] for the [Role] position"
                const snippet = message.snippet;
                // Very basic heuristic for snippet parsing
                if (snippet.includes('applied to')) {
                    const parts = snippet.split('applied to');
                    if (parts[1]) {
                        company_name = parts[1].split(' ')[1]; // First word after "applied to"
                    }
                }

                // If all else fails, use the Platform as the company placeholder so user can edit later
                if (!company_name) company_name = "Unknown Company";

                // If Title is still default, try to use Subject as title if it's not a generic application subject
                if (job_title === 'Job Application' && !subject.includes('Application sent')) {
                    job_title = subject;
                }
            }
        }

        // Cleanup
        company_name = company_name.replace(/['"]+/g, '');
        job_title = job_title.replace(/['"]+/g, '');

        if (company_name.length > 50) company_name = company_name.substring(0, 50); // Truncate
        if (job_title.length > 80) job_title = job_title.substring(0, 80);

        return {
            job_title,
            company_name,
            platform,
            applied_at: new Date(date).toISOString(),
            status: 'Applied',
        };

    } catch (error) {
        console.error('Error parsing email:', error);
        return null;
    }
}
