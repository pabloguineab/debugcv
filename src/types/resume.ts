// Resume data structures for the CV Builder

export interface ResumePersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    profileUrl?: string;
}

export interface ResumeExperience {
    id: string;
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
}

export interface ResumeEducation {
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
}

export interface ResumeData {
    id: string;
    name: string;
    targetJob?: string;
    targetCompany?: string;
    personalInfo: ResumePersonalInfo;
    summary: string;
    skills: string[];
    experience: ResumeExperience[];
    education: ResumeEducation[];
    template: "harvard" | "simple" | "modern";
    createdAt: string;
    updatedAt: string;
}

export interface ResumeScore {
    overall: number;
    breakdown: {
        keywords: number;
        format: number;
        experience: number;
        education: number;
    };
    suggestions: string[];
}
