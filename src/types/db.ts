export interface Application {
    id: string;
    title: string;
    company: string;
    status: string;
    location?: string;
    salary?: string;
    date?: string;
    jobDescription?: string;
    userEmail?: string;
    logo?: string | null;
}

export interface UserProfile {
    user_email?: string;
    full_name?: string;
    cv_text?: string;
    headline?: string;
}

// Add other types as needed by the full migration if referenced, keeping it minimal for Simulator
