// Resume data structures for the CV Builder

export interface ResumePersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    profileUrl?: string;
    linkedin?: string;
    github?: string;
    pictureUrl?: string;
}

export interface ResumeExperience {
    id: string;
    company: string;
    companyUrl?: string;
    logoUrl?: string;
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
    logoUrl?: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    website?: string;
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

export interface ResumeLanguage {
    language: string;
    level: string;
}

export interface ResumeData {
    id: string;
    name: string;
    targetJob?: string;
    targetCompany?: string;
    personalInfo: ResumePersonalInfo;
    summary: string;
    skills: string[];
    languages: ResumeLanguage[];
    experience: ResumeExperience[];
    education: ResumeEducation[];
    projects: ResumeProject[];
    certifications: ResumeCertification[];
    template: "harvard" | "simple" | "modern";
    atsScore?: number;
    showPhoto?: boolean;
    showCompanyLogos?: boolean;
    showInstitutionLogos?: boolean;
    accentColor?: string;
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
