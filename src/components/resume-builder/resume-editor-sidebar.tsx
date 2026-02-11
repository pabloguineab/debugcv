"use client";

import { useState } from "react";
import { ResumeData, ResumeExperience, ResumeEducation, ResumeProject, ResumeCertification } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Plus, ChevronDown, ChevronUp, Image as ImageIcon, Check, Palette, Building2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfilePictureUpload } from "@/components/resume-builder/profile-picture-upload";


import { fetchLogoAndReturnBase64 } from "@/lib/fetch-logo";
import { Reorder } from "framer-motion";
import { ExperienceItem } from "@/components/resume-builder/form/experience-item";
import { EducationItem } from "@/components/resume-builder/form/education-item";
import { ProjectItem } from "@/components/resume-builder/form/project-item";
import { CertificationItem } from "@/components/resume-builder/form/certification-item";

interface ResumeEditorSidebarProps {
    data: ResumeData;
    score: number;
    onUpdate: (data: Partial<ResumeData>) => void;
    onGenerateSummary: () => void;
    jobDescription?: string;
    onJobDescriptionChange?: (value: string) => void;
    isGenerating: boolean;
    activeSection?: string;
}

export function ResumeEditorSidebar({
    data,
    score,
    onUpdate,
    onGenerateSummary,
    jobDescription,
    onJobDescriptionChange,
    isGenerating,
    activeSection
}: ResumeEditorSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        targetJob: true,
        personal: true,
        summary: true,
        skills: true,
        experience: false,
        education: false,
        projects: false,
        certifications: false,
        template: true
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

    const addProject = () => {
        const newProject: ResumeProject = {
            id: crypto.randomUUID(),
            name: "",
            description: "",
            technologies: [],
            url: ""
        };
        onUpdate({ projects: [...data.projects, newProject] });
    };

    const updateProject = (index: number, updates: Partial<ResumeProject>) => {
        const newProjects = [...data.projects];
        newProjects[index] = { ...newProjects[index], ...updates };
        onUpdate({ projects: newProjects });
    };

    const removeProject = (index: number) => {
        onUpdate({ projects: data.projects.filter((_, i) => i !== index) });
    };

    const addCertification = () => {
        const newCert: ResumeCertification = {
            id: crypto.randomUUID(),
            name: "",
            issuer: "",
            issueDate: "",
            credentialId: "",
            url: ""
        };
        onUpdate({ certifications: [...data.certifications, newCert] });
    };

    const updateCertification = (index: number, updates: Partial<ResumeCertification>) => {
        const newCertifications = [...data.certifications];
        newCertifications[index] = { ...newCertifications[index], ...updates };
        onUpdate({ certifications: newCertifications });
    };

    const removeCertification = (index: number) => {
        onUpdate({ certifications: data.certifications.filter((_, i) => i !== index) });
    };

    const [isFetchingLogos, setIsFetchingLogos] = useState(false);

    const handleToggleCompanyLogos = async () => {
        const newValue = !data.showCompanyLogos;
        onUpdate({ showCompanyLogos: newValue });

        if (newValue) {
            setIsFetchingLogos(true);
            try {
                const newExperience = [...data.experience];
                let hasChanges = false;

                for (let i = 0; i < newExperience.length; i++) {
                    const exp = newExperience[i];
                    if (!exp.logoUrl && exp.company) {
                        const logo = await fetchLogoAndReturnBase64(exp.company, exp.companyUrl, "company");
                        if (logo) {
                            newExperience[i] = { ...exp, logoUrl: logo };
                            hasChanges = true;
                        }
                    }
                }

                if (hasChanges) {
                    onUpdate({ experience: newExperience });
                }
            } finally {
                setIsFetchingLogos(false);
            }
        }
    };

    const handleToggleInstitutionLogos = async () => {
        const newValue = !data.showInstitutionLogos;
        onUpdate({ showInstitutionLogos: newValue });

        if (newValue) {
            setIsFetchingLogos(true);
            try {
                const newEducation = [...data.education];
                let hasChanges = false;

                for (let i = 0; i < newEducation.length; i++) {
                    const edu = newEducation[i];
                    if (!edu.logoUrl && edu.institution) {
                        const logo = await fetchLogoAndReturnBase64(edu.institution, edu.website, "institution");
                        if (logo) {
                            newEducation[i] = { ...edu, logoUrl: logo };
                            hasChanges = true;
                        }
                    }
                }

                if (hasChanges) {
                    onUpdate({ education: newEducation });
                }
            } finally {
                setIsFetchingLogos(false);
            }
        }
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
                {/* Design & Layout - At the Top */}
                <div className={cn("border-b pb-4", activeSection === "template" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Design & Layout" section="template" />
                    {expandedSections.template && (
                        <div className="mt-3 space-y-4">
                            {/* Template Selection */}
                            <div>
                                <Label className="text-xs text-muted-foreground block mb-2">Template Style</Label>
                                <div className="flex gap-2">
                                    {(["harvard", "simple", "modern"] as const).map((template) => (
                                        <Button
                                            key={template}
                                            variant={data.template === template ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onUpdate({ template })}
                                            className="capitalize flex-1"
                                        >
                                            {template}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Accent Color */}
                            <div>
                                <Label className="text-xs text-muted-foreground block mb-2">Accent Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "#2563eb", // Default Blue
                                        "#1a1a1a", // Black
                                        "#059669", // Emerald
                                        "#7c3aed", // Violet
                                        "#e11d48", // Rose
                                        "#ea580c", // Orange
                                        "#0891b2", // Cyan
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => onUpdate({ accentColor: color })}
                                            className={cn(
                                                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                data.accentColor === color || (!data.accentColor && color === "#2563eb")
                                                    ? "border-gray-900 dark:border-white scale-110"
                                                    : "border-transparent hover:scale-110"
                                            )}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {(data.accentColor === color || (!data.accentColor && color === "#2563eb")) && (
                                                <Check className="w-4 h-4 text-white drop-shadow-md" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Profile Picture Control */}
                            {/* Profile Picture Control */}
                            <div className="flex items-start justify-between border rounded-lg p-3 bg-muted/20">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium">Profile Picture</span>
                                    </div>

                                    {data.showPhoto && (
                                        <ProfilePictureUpload
                                            value={data.personalInfo.pictureUrl}
                                            onChange={(url) => updatePersonalInfo("pictureUrl", url)}
                                            size={64}
                                            className="ml-1"
                                        />
                                    )}
                                </div>
                                <Button
                                    variant={data.showPhoto ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onUpdate({ showPhoto: !data.showPhoto })}
                                    className={cn("h-7 text-xs", data.showPhoto ? "bg-green-600 hover:bg-green-700" : "")}
                                >
                                    {data.showPhoto ? "On" : "Off"}
                                </Button>
                            </div>

                            {/* Harvard Specific Options */}
                            {data.template === "harvard" && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label className="text-xs text-muted-foreground block">Harvard Style Options</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center justify-between border rounded-lg p-2 bg-muted/20">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="text-xs font-medium">Company Logos</span>
                                            </div>
                                            <Button
                                                variant={data.showCompanyLogos ? "default" : "outline"}
                                                size="sm"
                                                onClick={handleToggleCompanyLogos}
                                                disabled={isFetchingLogos}
                                                className={cn("h-6 text-[10px] px-2", data.showCompanyLogos ? "bg-blue-600 hover:bg-blue-700" : "")}
                                            >
                                                {isFetchingLogos ? (
                                                    <Sparkles className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    data.showCompanyLogos ? "On" : "Off"
                                                )}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between border rounded-lg p-2 bg-muted/20">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="text-xs font-medium">Uni Logos</span>
                                            </div>
                                            <Button
                                                variant={data.showInstitutionLogos ? "default" : "outline"}
                                                size="sm"
                                                onClick={handleToggleInstitutionLogos}
                                                disabled={isFetchingLogos}
                                                className={cn("h-6 text-[10px] px-2", data.showInstitutionLogos ? "bg-blue-600 hover:bg-blue-700" : "")}
                                            >
                                                {isFetchingLogos ? (
                                                    <Sparkles className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    data.showInstitutionLogos ? "On" : "Off"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Target Job Details */}
                <div className={cn("border-b pb-4", activeSection === "targetJob" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Target Job Details" section="targetJob" />
                    {expandedSections.targetJob && (
                        <div className="space-y-3 mt-3">
                            <div className="flex items-center space-x-2 pb-2">
                                <Checkbox
                                    id="tailor-resume"
                                    checked={data.isTailored || false}
                                    onCheckedChange={(checked) => onUpdate({ isTailored: checked as boolean })}
                                />
                                <Label
                                    htmlFor="tailor-resume"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Tailor to a specific job description
                                </Label>
                            </div>

                            {data.isTailored && (
                                <div className="space-y-3 pl-2 border-l-2 border-muted ml-1">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Target Job Title</Label>
                                        <Input
                                            value={data.targetJob || ""}
                                            onChange={(e) => onUpdate({ targetJob: e.target.value })}
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Target Company</Label>
                                        <Input
                                            value={data.targetCompany || ""}
                                            onChange={(e) => onUpdate({ targetCompany: e.target.value })}
                                            placeholder="e.g. Acme Corp"
                                            className="mt-1"
                                        />
                                    </div>
                                    {onJobDescriptionChange && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Job Description</Label>
                                            <Textarea
                                                value={jobDescription || ""}
                                                onChange={(e) => onJobDescriptionChange(e.target.value)}
                                                placeholder="Paste the job description here to improve AI suggestions..."
                                                className="mt-1 min-h-[100px] resize-none text-xs"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
                                <Label className="text-xs text-muted-foreground">LinkedIn / Profile URL</Label>
                                <Input
                                    value={data.personalInfo.linkedin || ""}
                                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                                    placeholder="linkedin.com/in/yourname"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">GitHub URL</Label>
                                <Input
                                    value={data.personalInfo.github || ""}
                                    onChange={(e) => updatePersonalInfo("github", e.target.value)}
                                    placeholder="github.com/username"
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
                            <Reorder.Group axis="y" values={data.experience} onReorder={(newOrder) => onUpdate({ experience: newOrder })} className="space-y-3 list-none p-0">
                                {data.experience.map((exp, index) => (
                                    <ExperienceItem
                                        key={exp.id}
                                        item={exp}
                                        onUpdate={(updates) => updateExperience(index, updates)}
                                        onRemove={() => removeExperience(index)}
                                    />
                                ))}
                            </Reorder.Group>
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
                            <Reorder.Group axis="y" values={data.education} onReorder={(newOrder) => onUpdate({ education: newOrder })} className="space-y-3 list-none p-0">
                                {data.education.map((edu, index) => (
                                    <EducationItem
                                        key={edu.id}
                                        item={edu}
                                        onUpdate={(updates) => updateEducation(index, updates)}
                                        onRemove={() => removeEducation(index)}
                                    />
                                ))}
                            </Reorder.Group>
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

                {/* Projects */}
                <div className={cn("border-b pb-4", activeSection === "projects" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Projects" section="projects" />
                    {expandedSections.projects && (
                        <div className="mt-3 space-y-3">
                            <Label className="text-xs text-muted-foreground">Showcase relevant projects</Label>
                            <Reorder.Group axis="y" values={data.projects} onReorder={(newOrder) => onUpdate({ projects: newOrder })} className="space-y-3 list-none p-0">
                                {data.projects.map((project, index) => (
                                    <ProjectItem
                                        key={project.id}
                                        item={project}
                                        onUpdate={(updates) => updateProject(index, updates)}
                                        onRemove={() => removeProject(index)}
                                    />
                                ))}
                            </Reorder.Group>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addProject}
                                className="w-full border-dashed border"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add project
                            </Button>
                        </div>
                    )}
                </div>

                {/* Certifications */}
                <div className={cn("border-b pb-4", activeSection === "certifications" && "ring-2 ring-primary rounded-lg p-2")}>
                    <SectionHeader title="Certifications" section="certifications" />
                    {expandedSections.certifications && (
                        <div className="mt-3 space-y-3">
                            <Label className="text-xs text-muted-foreground">Add relevant certifications</Label>
                            <Reorder.Group axis="y" values={data.certifications} onReorder={(newOrder) => onUpdate({ certifications: newOrder })} className="space-y-3 list-none p-0">
                                {data.certifications.map((cert, index) => (
                                    <CertificationItem
                                        key={cert.id}
                                        item={cert}
                                        onUpdate={(updates) => updateCertification(index, updates)}
                                        onRemove={() => removeCertification(index)}
                                    />
                                ))}
                            </Reorder.Group>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addCertification}
                                className="w-full border-dashed border"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add certification
                            </Button>
                        </div>
                    )}
                </div>


            </div>
        </div >
    );
}
