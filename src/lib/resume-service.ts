"use client";

import { ResumeData } from "@/types/resume";

const STORAGE_KEY = "debugcv_resumes";

export interface SavedResume {
    id: string;
    name: string;
    targetJob?: string;
    targetCompany?: string;
    data: ResumeData;
    createdAt: string;
    updatedAt: string;
}

// Get all saved resumes
export function getResumes(): SavedResume[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

// Get a single resume by ID
export function getResume(id: string): SavedResume | null {
    const resumes = getResumes();
    return resumes.find(r => r.id === id) || null;
}

// Save or update a resume
export function saveResume(resume: SavedResume): void {
    const resumes = getResumes();
    const existingIndex = resumes.findIndex(r => r.id === resume.id);
    
    if (existingIndex >= 0) {
        // Update existing
        resumes[existingIndex] = {
            ...resume,
            updatedAt: new Date().toISOString()
        };
    } else {
        // Add new
        resumes.push({
            ...resume,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

// Save resume data (convenience function)
export function saveResumeData(id: string, name: string, data: ResumeData, targetJob?: string, targetCompany?: string): void {
    const existing = getResume(id);
    const resume: SavedResume = {
        id,
        name,
        targetJob,
        targetCompany,
        data,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    saveResume(resume);
}

// Delete a resume
export function deleteResume(id: string): void {
    const resumes = getResumes().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

// Generate a unique ID
export function generateResumeId(): string {
    return `resume_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
