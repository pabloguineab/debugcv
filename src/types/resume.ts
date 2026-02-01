// Resume data structures for the CV Builder

export interface ResumePersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    profileUrl?: string;
    linkedin?: string;
    github?: string;
}

export interface ResumeExperience {
    id: string;
    company: string;
    companyUrl?: string;
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

export interface ResumeProject {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
}

export interface ResumeCertification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
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
    projects: ResumeProject[];
    certifications: ResumeCertification[];
    template: "harvard" | "simple" | "modern";
    atsScore?: number;
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

// Type aliases for convenience
export type Experience = ResumeExperience;
export type Education = ResumeEducation;
export type Project = ResumeProject;
export type Certification = ResumeCertification;
export type PersonalInfo = ResumePersonalInfo;
