import { Application, UserProfile } from '@/types/db';

// This is a MOCK implementation to allow the Simulator to function without the full Database Setup.
// Replace this with the real Supabase implementation when fully migrating the backend.

export async function getUserProfile(email: string): Promise<UserProfile | null> {
    console.warn('[kv-db] Using MOCK UserProfile');
    return {
        full_name: "Demo Candidate",
        cv_text: "Senior Software Engineer with extensive experience in React, Next.js, and Node.js. Proven track record of delivering high-quality web applications.",
        user_email: email
    };
}

export const db = {
    async getApplications(userEmail: string): Promise<Application[]> {
        console.warn('[kv-db] Using MOCK Applications');
        return [
            {
                id: "demo-job", // Use this ID to test simulator: /dashboard/playbooks/simulator?jobId=demo-job
                title: "Senior Frontend Engineer",
                company: "TechGlobal",
                status: "interview",
                jobDescription: "We are seeking a talented Senior Frontend Engineer to join our dynamic team. You will be responsible for building scalable and performant user interfaces using React and TypeScript. Experience with AI integration is a plus.",
                date: new Date().toISOString(),
                userEmail,
                logo: null
            }
        ];
    }
};
