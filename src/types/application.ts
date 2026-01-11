export interface MatchAnalysis {
    score: number;
    missingKeywords: string[];
    missingTech: string[];
    recommendations: string[];
    matchingKeywords: string[];
}

export interface Contact {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    linkedin?: string;
}

export interface HistoryEntry {
    date: string;
    action: string;
    notes?: string;
}

export type ApplicationStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected';
export type ApplicationPriority = 'high' | 'medium' | 'low';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export interface Application {
    id: string;
    userEmail: string;
    title: string;
    company: string;
    logo?: string;
    jobUrl?: string;
    location?: string;
    workMode?: WorkMode;
    expectedSalary?: number[];
    priority: ApplicationPriority;
    status: ApplicationStatus;
    coverLetter?: string;
    notes?: string;
    jobDescription?: string;
    matchAnalysis?: MatchAnalysis;
    contacts?: Contact[];
    history?: HistoryEntry[];
    appliedDate?: string;
    interviewDate?: string;
    offerDate?: string;
    rejectedDate?: string;
    date: string;
}

export const STATUS_COLUMNS: { id: ApplicationStatus; title: string; color: string; bgColor: string }[] = [
    { id: 'wishlist', title: 'Wishlist', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { id: 'applied', title: 'Applied', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'interview', title: 'Interview', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { id: 'offer', title: 'Offer', color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'rejected', title: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
];
