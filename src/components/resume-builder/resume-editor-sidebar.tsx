"use client";

import { useState } from "react";
import { ResumeData, ResumeExperience, ResumeEducation } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeEditorSidebarProps {
    data: ResumeData;
    score: number;
    onUpdate: (data: Partial<ResumeData>) => void;
    onGenerateSummary: () => void;
    isGenerating: boolean;
    activeSection?: string;
}

export function ResumeEditorSidebar({
    data,
    score,
    onUpdate,
    onGenerateSummary,
    isGenerating,
    activeSection
}: ResumeEditorSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        personal: true,
        summary: true,
        skills: true,
        experience: false,
        education: false,
        template: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updatePersonalInfo = (field: string, value: string) => {
        onUpdate({
            personalInfo: {
                ...data.personalInfo,
                [field]: value
            }
        });
    };

    const addExperience = () => {
        const newExp: ResumeExperience = {
            id: crypto.randomUUID(),
            company: "",
            title: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [""]
        };
        onUpdate({ experience: [...data.experience, newExp] });
    };

    const updateExperience = (index: number, updates: Partial<ResumeExperience>) => {
        const newExperience = [...data.experience];
        newExperience[index] = { ...newExperience[index], ...updates };
        onUpdate({ experience: newExperience });
    };

    const removeExperience = (index: number) => {
        onUpdate({ experience: data.experience.filter((_, i) => i !== index) });
    };

    const addEducation = () => {
        const newEdu: ResumeEducation = {
            id: crypto.randomUUID(),
            institution: "",
            degree: "",
            field: "",
            location: "",
            startDate: "",
            endDate: ""
        };
        onUpdate({ education: [...data.education, newEdu] });
    };

    const updateEducation = (index: number, updates: Partial<ResumeEducation>) => {
        const newEducation = [...data.education];
        newEducation[index] = { ...newEducation[index], ...updates };
        onUpdate({ education: newEducation });
    };

    const removeEducation = (index: number) => {
        onUpdate({ education: data.education.filter((_, i) => i !== index) });
    };

    const SectionHeader = ({ title, section }: { title: string; section: string }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary"
        >
            {title}
            {expandedSections[section] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
    );

    return (
        <div className="h-full overflow-y-auto bg-background border-r">
            {/* Resume Score */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <svg className="w-16 h-16 rotate-[-90deg]">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeDasharray={`${(score / 100) * 176} 176`}
                                strokeLinecap="round"
                                className="text-primary"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                            {score}%
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold">Resume score</h3>
                        <p className="text-xs text-muted-foreground">The higher the score, the better.</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Personal Info */}
                <div className={cn("border-b pb-4", activeSection === "personal" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Personal Information" section="personal" />
                    {expandedSections.personal && (
                        <div className="space-y-3 mt-3">
                            <div>
                                <Label className="text-xs text-muted-foreground">Full name</Label>
                                <Input
                                    value={data.personalInfo.fullName}
                                    onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                                    placeholder="Enter your full name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <Input
                                    value={data.personalInfo.email}
                                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                                    placeholder="your@email.com"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Phone number</Label>
                                <Input
                                    value={data.personalInfo.phone}
                                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                                    placeholder="+1 555-123-4567"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Location</Label>
                                <Input
                                    value={data.personalInfo.location}
                                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                                    placeholder="City, Country"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Profile URL</Label>
                                <Input
                                    value={data.personalInfo.profileUrl || ""}
                                    onChange={(e) => updatePersonalInfo("profileUrl", e.target.value)}
                                    placeholder="linkedin.com/in/yourname"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className={cn("border-b pb-4", activeSection === "summary" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Resume Summary" section="summary" />
                    {expandedSections.summary && (
                        <div className="mt-3">
                            <Label className="text-xs text-muted-foreground">2-3 sentences highlighting your key qualifications</Label>
                            <Textarea
                                value={data.summary}
                                onChange={(e) => onUpdate({ summary: e.target.value })}
                                placeholder="Write a compelling summary..."
                                className="mt-1 min-h-[100px] resize-none"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onGenerateSummary}
                                disabled={isGenerating}
                                className="mt-2 text-primary hover:text-primary hover:bg-primary/10"
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                {isGenerating ? "Generating..." : "Generate"}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className={cn("border-b pb-4", activeSection === "skills" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Skills" section="skills" />
                    {expandedSections.skills && (
                        <div className="mt-3">
                            <Label className="text-xs text-muted-foreground">Add 5-8 relevant skills</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                                    >
                                        {skill}
                                        <button
                                            onClick={() => onUpdate({ skills: data.skills.filter((_, i) => i !== index) })}
                                            className="hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <Input
                                placeholder="Type a skill and press Enter"
                                className="mt-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.currentTarget.value) {
                                        onUpdate({ skills: [...data.skills, e.currentTarget.value] });
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Experience */}
                <div className={cn("border-b pb-4", activeSection === "experience" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Work Experience" section="experience" />
                    {expandedSections.experience && (
                        <div className="mt-3 space-y-3">
                            <Label className="text-xs text-muted-foreground">Focus on your most relevant experiences</Label>
                            {data.experience.map((exp, index) => (
                                <div key={exp.id} className="border rounded-lg p-3 bg-muted/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                            <span className="text-sm font-medium truncate max-w-[200px]">
                                                {exp.title || "New Position"}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:text-red-600"
                                            onClick={() => removeExperience(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            value={exp.company}
                                            onChange={(e) => updateExperience(index, { company: e.target.value })}
                                            placeholder="Company name"
                                            className="h-8 text-xs"
                                        />
                                        <Input
                                            value={exp.title}
                                            onChange={(e) => updateExperience(index, { title: e.target.value })}
                                            placeholder="Job title"
                                            className="h-8 text-xs"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                value={exp.startDate}
                                                onChange={(e) => updateExperience(index, { startDate: e.target.value })}
                                                placeholder="Start date"
                                                className="h-8 text-xs"
                                            />
                                            <Input
                                                value={exp.current ? "Present" : exp.endDate}
                                                onChange={(e) => updateExperience(index, { endDate: e.target.value })}
                                                placeholder="End date"
                                                className="h-8 text-xs"
                                                disabled={exp.current}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addExperience}
                                className="w-full border-dashed border"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add position
                            </Button>
                        </div>
                    )}
                </div>

                {/* Education */}
                <div className={cn("border-b pb-4", activeSection === "education" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Education" section="education" />
                    {expandedSections.education && (
                        <div className="mt-3 space-y-3">
                            <Label className="text-xs text-muted-foreground">List your educational qualifications</Label>
                            {data.education.map((edu, index) => (
                                <div key={edu.id} className="border rounded-lg p-3 bg-muted/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                            <span className="text-sm font-medium truncate max-w-[200px]">
                                                {edu.degree || "New Education"}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:text-red-600"
                                            onClick={() => removeEducation(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, { institution: e.target.value })}
                                            placeholder="Institution name"
                                            className="h-8 text-xs"
                                        />
                                        <Input
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, { degree: e.target.value })}
                                            placeholder="Degree (e.g., B.Sc.)"
                                            className="h-8 text-xs"
                                        />
                                        <Input
                                            value={edu.field}
                                            onChange={(e) => updateEducation(index, { field: e.target.value })}
                                            placeholder="Field of study"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addEducation}
                                className="w-full border-dashed border"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add education
                            </Button>
                        </div>
                    )}
                </div>

                {/* Template Selection */}
                <div className={cn("pb-4", activeSection === "template" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Resume Template" section="template" />
                    {expandedSections.template && (
                        <div className="mt-3">
                            <Label className="text-xs text-muted-foreground">Choose a template for your resume</Label>
                            <div className="flex gap-2 mt-2">
                                {(["harvard", "simple", "modern"] as const).map((template) => (
                                    <Button
                                        key={template}
                                        variant={data.template === template ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onUpdate({ template })}
                                        className="capitalize"
                                    >
                                        {template}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
