"use client";

import { useMemo } from "react";
import { Typewriter, SequentialAnimationProvider } from "@/components/ui/sequential-typewriter";
import { EditableText } from "./editable-text";
import { ResumeData, Experience, Education, Project, Certification, ResumeLanguage } from "@/types/resume";
import { calculateStyleConfig, StyleConfig } from "@/lib/resume-styles";

interface ResumePreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    onUpdate?: (updates: Partial<ResumeData>) => void;
    animate?: boolean;
}

export function ResumePreview({ data, onFieldClick, onUpdate, animate = false }: ResumePreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    // Calculate dynamic styles based on content density
    const styleConfig = useMemo(() => calculateStyleConfig(data), [data]);

    // Scale factor for web (PDF uses pt, we use px with 1.25x scale for readability)
    const scale = 1.25;
    const styles = useMemo(() => ({
        container: {
            padding: `${styleConfig.pagePaddingTop * scale}px ${styleConfig.pagePadding * scale}px ${styleConfig.pagePaddingBottom * scale}px`,
        },
        name: {
            fontSize: `${styleConfig.nameFontSize * scale}px`,
        },
        sectionTitle: {
            fontSize: `${styleConfig.sectionTitleSize * scale}px`,
            marginTop: `${styleConfig.sectionMarginTop * scale}px`,
            marginBottom: `${styleConfig.sectionMarginBottom * scale}px`,
        },
        entryTitle: {
            fontSize: `${styleConfig.entryTitleSize * scale}px`,
        },
        detail: {
            fontSize: `${styleConfig.detailFontSize * scale}px`,
            lineHeight: styleConfig.lineHeight,
        },
        entryMargin: {
            marginBottom: `${styleConfig.entryMarginBottom * scale}px`,
        },
        bulletMargin: {
            marginBottom: `${styleConfig.bulletMarginBottom * scale}px`,
        },
        sectionMargin: {
            marginBottom: `${styleConfig.sectionMarginBottom * scale}px`,
        },
    }), [styleConfig, scale]);

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

    const updateSkills = (skillsString: string) => {
        // Parse skills from bullet-separated string or comma-separated
        const newSkills = skillsString
            .split(/[•,]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        onUpdate?.({ skills: newSkills });
    };

    // Himalayas-style resume template with dynamic styling
    return (
        <div
            className="bg-white rounded-lg mx-auto border border-gray-200 shadow-sm"
            style={{
                width: "100%",
                maxWidth: "800px",
                minHeight: "1100px"
            }}
            data-resume-preview="true"
        >
            <SequentialAnimationProvider animate={animate}>
                {/* Resume Paper - Dynamic Styles */}
                <div
                    className="text-gray-800"
                    style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        ...styles.container
                    }}
                >
                    {/* Header */}
                    <div className="text-center" style={styles.sectionMargin}>
                        <h1 className="font-normal tracking-wide mb-2" style={styles.name}>
                            <EditableText
                                value={personalInfo.fullName}
                                onChange={(v) => updatePersonalInfo("fullName", v)}
                                placeholder="Your Name"
                                displayComponent={<Typewriter text={personalInfo.fullName || "Your Name"} />}
                            />
                        </h1>

                        <div className="w-full h-px bg-gray-300 mx-auto mb-3" />

                        <p className="text-gray-600 flex justify-center items-center flex-wrap gap-1" style={styles.detail}>
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
                            {personalInfo.linkedin && (
                                <>
                                    <span> • </span>
                                    <a
                                        href={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        <Typewriter text="LinkedIn" />
                                    </a>
                                </>
                            )}
                            {personalInfo.github && (
                                <>
                                    <span> • </span>
                                    <a
                                        href={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        <Typewriter text="GitHub" />
                                    </a>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Professional Summary */}
                    <div style={styles.sectionMargin}>
                        <h2 className="font-bold text-center uppercase tracking-wide" style={styles.sectionTitle}>
                            <Typewriter text="Professional summary" speed={5} />
                        </h2>
                        <div className="leading-relaxed text-gray-700 min-h-[3em]" style={styles.detail}>
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
                        <div style={styles.sectionMargin}>
                            <h2 className="font-bold text-center uppercase tracking-wide" style={styles.sectionTitle}>
                                <Typewriter text="Education" speed={5} />
                            </h2>
                            <div>
                                {education.map((edu, index) => (
                                    <div key={edu.id} style={styles.entryMargin}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold uppercase tracking-wide" style={styles.entryTitle}>
                                                    <EditableText
                                                        value={edu.institution}
                                                        onChange={(v) => updateEducation(index, { institution: v })}
                                                        placeholder="Institution"
                                                        displayComponent={<Typewriter text={edu.institution} />}
                                                    />
                                                </div>
                                                <div className="text-gray-600" style={styles.detail}>
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
                                            <div className="flex flex-col items-end text-gray-600 shrink-0" style={styles.detail}>
                                                <div>
                                                    <EditableText
                                                        value={edu.location || ""}
                                                        onChange={(v) => updateEducation(index, { location: v })}
                                                        placeholder="Location"
                                                        displayComponent={<Typewriter text={edu.location || ""} />}
                                                    />
                                                </div>
                                                <div>
                                                    <EditableText
                                                        value={formatDateRange(edu.startDate, edu.endDate)}
                                                        onChange={(v) => {
                                                            // Parse "StartDate - EndDate" format
                                                            const parts = v.split(" - ");
                                                            const startDate = parts[0]?.trim() || "";
                                                            const endDate = parts[1]?.trim() || "";
                                                            updateEducation(index, { startDate, endDate });
                                                        }}
                                                        placeholder="Date Range"
                                                        displayComponent={<Typewriter text={formatDateRange(edu.startDate, edu.endDate)} />}
                                                    />
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
                        <div style={styles.sectionMargin}>
                            <h2 className="font-bold text-center uppercase tracking-wide" style={styles.sectionTitle}>
                                <Typewriter text="Experience" speed={5} />
                            </h2>
                            <div>
                                {experience.map((exp, index) => (
                                    <div key={exp.id} style={styles.entryMargin}>
                                        <div className="flex justify-between items-start mb-1 gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-bold uppercase tracking-wide ${exp.companyUrl ? 'text-blue-600' : ''}`} style={styles.entryTitle}>
                                                    {exp.companyUrl ? (
                                                        <a
                                                            href={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline"
                                                        >
                                                            <EditableText
                                                                value={exp.company}
                                                                onChange={(v) => updateExperience(index, { company: v })}
                                                                placeholder="Company"
                                                                displayComponent={<Typewriter text={exp.company} />}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <EditableText
                                                            value={exp.company}
                                                            onChange={(v) => updateExperience(index, { company: v })}
                                                            placeholder="Company"
                                                            displayComponent={<Typewriter text={exp.company} />}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-gray-700" style={styles.detail}>
                                                    <EditableText
                                                        value={exp.title}
                                                        onChange={(v) => updateExperience(index, { title: v })}
                                                        placeholder="Job Title"
                                                        displayComponent={<Typewriter text={exp.title} />}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-gray-600 shrink-0" style={styles.detail}>
                                                <div>
                                                    <EditableText
                                                        value={exp.location || ""}
                                                        onChange={(v) => updateExperience(index, { location: v })}
                                                        placeholder="Location"
                                                        displayComponent={<Typewriter text={exp.location || ""} />}
                                                    />
                                                </div>
                                                <div>
                                                    <EditableText
                                                        value={formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                                        onChange={(v) => {
                                                            // Parse "StartDate - EndDate" or "StartDate - Present"
                                                            const parts = v.split(" - ");
                                                            const startDate = parts[0]?.trim() || "";
                                                            const endPart = parts[1]?.trim() || "";
                                                            const current = endPart.toLowerCase() === "present";
                                                            const endDate = current ? "" : endPart;
                                                            updateExperience(index, { startDate, endDate, current });
                                                        }}
                                                        placeholder="Date Range"
                                                        displayComponent={<Typewriter text={formatDateRange(exp.startDate, exp.endDate, exp.current)} />}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {exp.bullets.length > 0 && (
                                            <div className="ml-4 text-gray-700 mt-2" style={styles.detail}>
                                                {exp.bullets.map((bullet, bulletIndex) => (
                                                    <div key={bulletIndex} className="leading-relaxed w-full" style={styles.bulletMargin}>
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
                        <div style={styles.sectionMargin}>
                            <h2 className="font-bold text-center uppercase tracking-wide" style={styles.sectionTitle}>
                                <Typewriter text="Projects" speed={5} />
                            </h2>
                            <div>
                                {projects.map((project, index) => (
                                    <div key={project.id} style={styles.entryMargin}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold uppercase tracking-wide" style={styles.entryTitle}>
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
                                        <div className="text-gray-700 leading-relaxed" style={styles.detail}>
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
                        <div style={styles.sectionMargin}>
                            <h2 className="font-bold text-center uppercase tracking-wide" style={styles.sectionTitle}>
                                <Typewriter text="Certifications" speed={5} />
                            </h2>
                            <div>
                                {certifications.map((cert, index) => (
                                    <div key={cert.id} style={styles.entryMargin}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold" style={styles.detail}>
                                                    <EditableText
                                                        value={cert.name}
                                                        onChange={(v) => updateCertification(index, { name: v })}
                                                        placeholder="Certification Name"
                                                        displayComponent={<Typewriter text={cert.name} />}
                                                    />
                                                </div>
                                                <div className="text-gray-600" style={styles.detail}>
                                                    <EditableText
                                                        value={cert.issuer}
                                                        onChange={(v) => updateCertification(index, { issuer: v })}
                                                        placeholder="Issuer"
                                                        displayComponent={<Typewriter text={cert.issuer} />}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-gray-600" style={styles.detail}>
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
                        <div style={styles.sectionMargin}>
                            <h2 className="font-bold text-center uppercase tracking-wide" style={styles.sectionTitle}>
                                <Typewriter text="Skills" speed={5} />
                            </h2>
                            <div className="text-gray-700 text-center" style={styles.detail}>
                                <EditableText
                                    value={skills.join(" • ")}
                                    onChange={updateSkills}
                                    placeholder="Add skills separated by commas..."
                                    multiline
                                    displayComponent={<Typewriter text={skills.join(" • ")} speed={10} />}
                                />
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {languages && languages.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <h2 className="font-bold text-center uppercase tracking-wide" style={styles.sectionTitle}>
                                <Typewriter text="Languages" speed={5} />
                            </h2>
                            <div className="text-gray-700 text-center" style={styles.detail}>
                                <Typewriter
                                    text={languages.map(lang => `${lang.language} (${lang.level})`).join(" • ")}
                                    speed={10}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </SequentialAnimationProvider>
        </div>
    );
}
