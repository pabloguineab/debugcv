"use client";

import { Typewriter, SequentialAnimationProvider } from "@/components/ui/sequential-typewriter";
import { EditableText } from "./editable-text";
import { ResumeData, Experience, Education, Project, Certification } from "@/types/resume";

interface ResumePreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    onUpdate?: (updates: Partial<ResumeData>) => void;
    animate?: boolean;
}

export function ResumePreview({ data, onFieldClick, onUpdate, animate = false }: ResumePreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

    // Helper to format date ranges (avoids "- 2023" when startDate is empty)
    const formatDateRange = (startDate?: string, endDate?: string, current?: boolean) => {
        const end = current ? "Present" : (endDate || "");
        const start = startDate || "";
        
        if (start && end) return `${start} - ${end}`;
        if (start) return start;
        if (end) return end;
        return "";
    };

    // Update handlers for inline editing
    const updatePersonalInfo = (field: string, value: string) => {
        onUpdate?.({
            personalInfo: { ...personalInfo, [field]: value }
        });
    };

    const updateSummary = (value: string) => {
        onUpdate?.({ summary: value });
    };

    const updateExperience = (index: number, updates: Partial<Experience>) => {
        const newExperience = [...experience];
        newExperience[index] = { ...newExperience[index], ...updates };
        onUpdate?.({ experience: newExperience });
    };

    const updateEducation = (index: number, updates: Partial<Education>) => {
        const newEducation = [...education];
        newEducation[index] = { ...newEducation[index], ...updates };
        onUpdate?.({ education: newEducation });
    };

    const updateProject = (index: number, updates: Partial<Project>) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], ...updates };
        onUpdate?.({ projects: newProjects });
    };

    const updateCertification = (index: number, updates: Partial<Certification>) => {
        const newCertifications = [...certifications];
        newCertifications[index] = { ...newCertifications[index], ...updates };
        onUpdate?.({ certifications: newCertifications });
    };

    const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
        const newExperience = [...experience];
        const newBullets = [...newExperience[expIndex].bullets];
        newBullets[bulletIndex] = value;
        newExperience[expIndex] = { ...newExperience[expIndex], bullets: newBullets };
        onUpdate?.({ experience: newExperience });
    };

    // Himalayas-style resume template
    return (
        <div 
            className="bg-white rounded-lg mx-auto border border-gray-200 shadow-sm"
            style={{ 
                width: "100%",
                maxWidth: "800px",
                minHeight: "1100px"
            }}
        >
            <SequentialAnimationProvider animate={animate}>
                {/* Resume Paper - Himalayas Style */}
                <div 
                    className="px-10 py-8 text-gray-800"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-[26px] font-normal tracking-wide mb-2">
                            <EditableText
                                value={personalInfo.fullName}
                                onChange={(v) => updatePersonalInfo("fullName", v)}
                                placeholder="Your Name"
                                displayComponent={<Typewriter text={personalInfo.fullName || "Your Name"} />}
                            />
                        </h1>
                        
                        <div className="w-full h-px bg-gray-300 mx-auto mb-3" />

                        <p className="text-[11px] text-gray-600 flex justify-center items-center flex-wrap gap-1">
                            <EditableText
                                value={personalInfo.location}
                                onChange={(v) => updatePersonalInfo("location", v)}
                                placeholder="City, State"
                                displayComponent={<Typewriter text={personalInfo.location || "City, State"} />}
                            />
                            {personalInfo.email && <span> • </span>}
                            <span className="text-blue-600">
                                <EditableText
                                    value={personalInfo.email}
                                    onChange={(v) => updatePersonalInfo("email", v)}
                                    placeholder="email@example.com"
                                    displayComponent={<Typewriter text={personalInfo.email || ""} />}
                                />
                            </span>
                            {personalInfo.phone && <span> • </span>}
                            <EditableText
                                value={personalInfo.phone}
                                onChange={(v) => updatePersonalInfo("phone", v)}
                                placeholder="+1 234 567 890"
                                displayComponent={<Typewriter text={personalInfo.phone || ""} />}
                            />
                        </p>
                    </div>

                    {/* Professional Summary */}
                    <div className="mb-5">
                        <h2 className="text-[13px] font-bold text-center mb-3">
                            <Typewriter text="Professional summary" speed={5} />
                        </h2>
                        <div className="text-[11px] leading-relaxed text-gray-700 min-h-[3em]">
                            <EditableText
                                value={summary}
                                onChange={updateSummary}
                                placeholder="Click to add a professional summary..."
                                multiline
                                displayComponent={
                                    <Typewriter 
                                        text={summary || (animate ? "" : "Click to add a professional summary highlighting your key qualifications, experience, and career goals.")} 
                                        speed={3} 
                                    />
                                }
                            />
                        </div>
                    </div>

                    {/* Education */}
                    {education.length > 0 && (
                        <div className="mb-5">
                            <h2 className="text-[13px] font-bold text-center mb-3">
                                <Typewriter text="Education" speed={5} />
                            </h2>
                            <div className="space-y-3">
                                {education.map((edu, index) => (
                                    <div key={edu.id} className="p-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold uppercase tracking-wide">
                                                    <EditableText
                                                        value={edu.institution}
                                                        onChange={(v) => updateEducation(index, { institution: v })}
                                                        placeholder="Institution"
                                                        displayComponent={<Typewriter text={edu.institution} />}
                                                    />
                                                </div>
                                                <div className="text-[11px] text-gray-600">
                                                    <EditableText
                                                        value={`${edu.degree} in ${edu.field}`}
                                                        onChange={(v) => {
                                                            // Parse "Degree in Field" format
                                                            const parts = v.split(" in ");
                                                            updateEducation(index, { 
                                                                degree: parts[0] || "", 
                                                                field: parts.slice(1).join(" in ") || "" 
                                                            });
                                                        }}
                                                        placeholder="Degree in Field"
                                                        displayComponent={<Typewriter text={`${edu.degree} in ${edu.field}`} />}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-[11px] text-gray-600 shrink-0">
                                                <div>
                                                    <EditableText
                                                        value={edu.location || ""}
                                                        onChange={(v) => updateEducation(index, { location: v })}
                                                        placeholder="Location"
                                                        displayComponent={<Typewriter text={edu.location || ""} />}
                                                    />
                                                </div>
                                                <div>
                                                    <Typewriter text={formatDateRange(edu.startDate, edu.endDate)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div className="mb-5">
                            <h2 className="text-[13px] font-bold text-center mb-3">
                                <Typewriter text="Experience" speed={5} />
                            </h2>
                            <div className="space-y-4">
                                {experience.map((exp, index) => (
                                    <div key={exp.id} className="p-1">
                                        <div className="flex justify-between items-start mb-1 gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold uppercase tracking-wide">
                                                    <EditableText
                                                        value={exp.company}
                                                        onChange={(v) => updateExperience(index, { company: v })}
                                                        placeholder="Company"
                                                        displayComponent={<Typewriter text={exp.company} />}
                                                    />
                                                </div>
                                                <div className="text-[11px] text-gray-700">
                                                    <EditableText
                                                        value={exp.title}
                                                        onChange={(v) => updateExperience(index, { title: v })}
                                                        placeholder="Job Title"
                                                        displayComponent={<Typewriter text={exp.title} />}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-[11px] text-gray-600 shrink-0">
                                                <div>
                                                    <EditableText
                                                        value={exp.location || ""}
                                                        onChange={(v) => updateExperience(index, { location: v })}
                                                        placeholder="Location"
                                                        displayComponent={<Typewriter text={exp.location || ""} />}
                                                    />
                                                </div>
                                                <div>
                                                    <Typewriter text={formatDateRange(exp.startDate, exp.endDate, exp.current)} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {exp.bullets.length > 0 && (
                                            <div className="ml-4 text-[11px] text-gray-700 space-y-1 mt-2">
                                                {exp.bullets.map((bullet, bulletIndex) => (
                                                    <div key={bulletIndex} className="leading-relaxed w-full">
                                                        <EditableText
                                                            value={bullet}
                                                            onChange={(v) => updateBullet(index, bulletIndex, v)}
                                                            placeholder="Achievement or responsibility..."
                                                            multiline
                                                            displayComponent={<Typewriter text={`• ${bullet}`} speed={2} />}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div className="mb-5">
                            <h2 className="text-[13px] font-bold text-center mb-3">
                                <Typewriter text="Projects" speed={5} />
                            </h2>
                            <div className="space-y-3">
                                {projects.map((project, index) => (
                                    <div key={project.id} className="p-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-[11px] font-bold uppercase tracking-wide">
                                                <EditableText
                                                    value={project.name}
                                                    onChange={(v) => updateProject(index, { name: v })}
                                                    placeholder="Project Name"
                                                    displayComponent={<Typewriter text={project.name} />}
                                                />
                                            </div>
                                            {project.url && (
                                                <span className="text-[10px] text-blue-600">
                                                    <EditableText
                                                        value={project.url}
                                                        onChange={(v) => updateProject(index, { url: v })}
                                                        placeholder="URL"
                                                        displayComponent={<Typewriter text={project.url} />}
                                                    />
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-gray-700 leading-relaxed">
                                            <EditableText
                                                value={project.description}
                                                onChange={(v) => updateProject(index, { description: v })}
                                                placeholder="Project description..."
                                                multiline
                                                displayComponent={<Typewriter text={project.description} speed={2} />}
                                            />
                                        </div>
                                        {project.technologies.length > 0 && (
                                            <div className="text-[10px] text-gray-500 mt-1">
                                                <span className="font-semibold"><Typewriter text="Technologies: " /></span> 
                                                <Typewriter text={project.technologies.join(", ")} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <div className="mb-5">
                            <h2 className="text-[13px] font-bold text-center mb-3">
                                <Typewriter text="Certifications" speed={5} />
                            </h2>
                            <div className="space-y-2">
                                {certifications.map((cert, index) => (
                                    <div key={cert.id} className="p-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[11px] font-bold">
                                                    <EditableText
                                                        value={cert.name}
                                                        onChange={(v) => updateCertification(index, { name: v })}
                                                        placeholder="Certification Name"
                                                        displayComponent={<Typewriter text={cert.name} />}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-gray-600">
                                                    <EditableText
                                                        value={cert.issuer}
                                                        onChange={(v) => updateCertification(index, { issuer: v })}
                                                        placeholder="Issuer"
                                                        displayComponent={<Typewriter text={cert.issuer} />}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-[10px] text-gray-600">
                                                <div>
                                                    <Typewriter text={`${cert.issueDate}${cert.expiryDate ? ` - ${cert.expiryDate}` : ""}`} />
                                                </div>
                                                {cert.credentialId && (
                                                    <div className="text-gray-500">
                                                        <Typewriter text={`ID: ${cert.credentialId}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div>
                            <h2 className="text-[13px] font-bold text-center mb-3">
                                <Typewriter text="Skills" speed={5} />
                            </h2>
                            <div 
                                className="text-[11px] text-gray-700 cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors text-center"
                                onClick={() => onFieldClick?.("skills")}
                            >
                                <Typewriter text={skills.join(" • ")} speed={10} />
                            </div>
                        </div>
                    )}
                </div>
            </SequentialAnimationProvider>
        </div>
    );
}
