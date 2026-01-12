'use server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';

export interface Job {
    job_id: string;
    employer_name: string;
    employer_logo: string | null;
    employer_website: string | null;
    job_publisher: string;
    job_employment_type: string;
    job_title: string;
    job_apply_link: string;
    job_description: string;
    job_is_remote: boolean;
    job_posted_at_timestamp: number;
    job_posted_at_datetime_utc: string;
    job_city: string;
    job_state: string;
    job_country: string;
    job_google_link: string;
    job_min_salary: number | null;
    job_max_salary: number | null;
    job_salary_currency: string | null;
    job_salary_period: string | null;
}

export interface SearchJobsResponse {
    status: string;
    request_id: string;
    data: Job[];
}

export async function searchJobs(
    query: string,
    filters: {
        page?: number;
        num_pages?: number;
        date_posted?: 'all' | 'today' | '3days' | 'week' | 'month';
        remote_jobs_only?: boolean;
        employment_types?: 'FULLTIME' | 'CONTRACT' | 'PARTTIME' | 'INTERN';
        job_requirements?: string;
    } = {}
): Promise<Job[]> {
    if (!RAPIDAPI_KEY) {
        console.error("RAPIDAPI_KEY is missing");
        return [];
    }

    const {
        page = 1,
        num_pages = 1,
        date_posted = 'month',
        remote_jobs_only = false,
        employment_types,
        job_requirements
    } = filters;

    // Infer country code from query - THIS IS CRITICAL for non-US searches
    const countryCode = inferCountry(query);

    const params = new URLSearchParams({
        query,
        page: page.toString(),
        num_pages: num_pages.toString(),
        date_posted,
        remote_jobs_only: remote_jobs_only.toString(),
        country: countryCode,
    });

    if (employment_types) params.append('employment_types', employment_types);
    if (job_requirements) params.append('job_requirements', job_requirements);

    try {
        const url = `https://${RAPIDAPI_HOST}/search?${params.toString()}`;
        console.log(`[searchJobs] Fetching: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`JSearch API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const result = await response.json() as SearchJobsResponse;
        let jobs = result.data || [];

        console.log(`[searchJobs] Found ${jobs.length} results for: "${query}" (country: ${countryCode})`);

        if (remote_jobs_only) {
            jobs = jobs.filter(job => job.job_is_remote === true);
        }

        return jobs;

    } catch (error) {
        console.error("Error searching jobs:", error);
        return [];
    }
}

function inferCountry(query: string): string {
    const q = query.toLowerCase();

    // Spain
    if (q.includes('spain') || q.includes('españa') || q.includes('madrid') ||
        q.includes('barcelona') || q.includes('valencia') || q.includes('sevilla') ||
        q.includes('bilbao') || q.includes('malaga') || q.includes('zaragoza')) {
        return 'es';
    }

    // United Kingdom
    if (q.includes('uk') || q.includes('united kingdom') || q.includes('london') ||
        q.includes('manchester') || q.includes('birmingham') || q.includes('bristol')) {
        return 'gb';
    }

    // Germany
    if (q.includes('germany') || q.includes('deutschland') || q.includes('berlin') ||
        q.includes('munich') || q.includes('hamburg') || q.includes('frankfurt')) {
        return 'de';
    }

    // France
    if (q.includes('france') || q.includes('paris') || q.includes('lyon') || q.includes('marseille')) {
        return 'fr';
    }

    // Italy
    if (q.includes('italy') || q.includes('italia') || q.includes('rome') ||
        q.includes('roma') || q.includes('milan') || q.includes('milano')) {
        return 'it';
    }

    // Netherlands
    if (q.includes('netherlands') || q.includes('amsterdam') || q.includes('rotterdam')) {
        return 'nl';
    }

    // Default to 'us'
    return 'us';
}
