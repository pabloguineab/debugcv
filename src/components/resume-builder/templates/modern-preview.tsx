"use client";

import { useMemo } from "react";
import { Typewriter, SequentialAnimationProvider } from "@/components/ui/sequential-typewriter";
import { EditableText } from "../editable-text";
import { ResumeData, Experience, Education, Project, Certification, ResumeLanguage } from "@/types/resume";
import { calculateStyleConfig } from "@/lib/resume-styles";

interface ModernPreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    onUpdate?: (updates: Partial<ResumeData>) => void;
    animate?: boolean;
}

export function ModernPreview({ data, onFieldClick, onUpdate, animate = false }: ModernPreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    // Calculate dynamic styles based on content density
    const styleConfig = useMemo(() => calculateStyleConfig(data), [data]);

    // Scale factor for web (PDF uses pt, we use px with 1.2x scale)
    const scale = 1.2;
    const styles = useMemo(() => ({
        container: {
            padding: `${styleConfig.pagePaddingTop * scale}px ${styleConfig.pagePadding * scale}px ${styleConfig.pagePaddingBottom * scale}px`,
        },
        name: {
            fontSize: `${styleConfig.nameFontSize * scale * 1.1}px`,
            letterSpacing: '0.3em',
        },
        headline: {
            fontSize: `${styleConfig.detailFontSize * scale * 1.1}px`,
            letterSpacing: '0.15em',
        },
        sectionTitle: {
            fontSize: `${styleConfig.sectionTitleSize * scale * 0.9}px`,
            marginTop: `${styleConfig.sectionMarginTop * scale}px`,
            marginBottom: `${styleConfig.sectionMarginBottom * scale}px`,
            letterSpacing: '0.4em',
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

    // Helper to format date ranges
    const formatDateRange = (startDate?: string, endDate?: string, current?: boolean) => {
        const end = current ? "Present" : (endDate || "");
        const start = startDate || "";
        if (start && end) return `${start} - ${end}`;
        if (start) return start;
        if (end) return end;
        return "";
    };

    // Space letters for section titles (E D U C A T I O N)
    const spaceLetters = (text: string) => text.toUpperCase().split('').join(' ');

    // Update handlers
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
        const newSkills = skillsString
            .split(/[•,]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        onUpdate?.({ skills: newSkills });
    };

    // Group skills by category (simple heuristic based on keywords)
    const groupedSkills = useMemo(() => {
        const groups: Record<string, string[]> = {
            "Programming Languages": [],
            "Machine Learning": [],
            "Web Development": [],
            "Cloud & DevOps": [],
            "Data Analytics": [],
            "Other": []
        };

        const mlKeywords = ['tensorflow', 'pytorch', 'keras', 'ml', 'ai', 'neural', 'deep learning', 'nlp', 'llm', 'hugging', 'transformers', 'langchain', 'gensim', 'spacy', 'nltk'];
        const webKeywords = ['react', 'vue', 'angular', 'node', 'next', 'html', 'css', 'javascript', 'typescript', 'flask', 'fastapi', 'streamlit', 'gradio'];
        const cloudKeywords = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'devops', 'lambda', 's3', 'ec2', 'sagemaker'];
        const dataKeywords = ['pandas', 'numpy', 'scipy', 'matplotlib', 'tableau', 'power bi', 'sql', 'hadoop', 'spark', 'pyspark'];
        const langKeywords = ['python', 'javascript', 'java', 'c++', 'c#', 'r', 'matlab', 'bash', 'shell'];

        skills.forEach(skill => {
            const lower = skill.toLowerCase();
            if (langKeywords.some(k => lower.includes(k))) {
                groups["Programming Languages"].push(skill);
            } else if (mlKeywords.some(k => lower.includes(k))) {
                groups["Machine Learning"].push(skill);
            } else if (webKeywords.some(k => lower.includes(k))) {
                groups["Web Development"].push(skill);
            } else if (cloudKeywords.some(k => lower.includes(k))) {
                groups["Cloud & DevOps"].push(skill);
            } else if (dataKeywords.some(k => lower.includes(k))) {
                groups["Data Analytics"].push(skill);
            } else {
                groups["Other"].push(skill);
            }
        });

        // Filter out empty groups
        return Object.entries(groups).filter(([_, skills]) => skills.length > 0);
    }, [skills]);

    // Section divider with spaced text
    const SectionDivider = ({ title }: { title: string }) => (
        <div className="flex items-center gap-2" style={styles.sectionTitle}>
            <div className="flex-1 h-px bg-[#2c4a7c]" />
            <span className="text-[#2c4a7c] font-normal tracking-[0.4em] uppercase text-xs">
                {spaceLetters(title)}
            </span>
            <div className="flex-1 h-px bg-[#2c4a7c]" />
        </div>
    );

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
                <div
                    className="text-gray-800"
                    style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        ...styles.container
                    }}
                >
                    {/* Header with photo placeholder */}
                    <div className="flex justify-between items-start" style={styles.sectionMargin}>
                        <div className="flex-1">
                            {/* Name with spaced letters */}
                            <h1
                                className="font-bold text-[#2c4a7c] mb-2"
                                style={styles.name}
                            >
                                <EditableText
                                    value={personalInfo.fullName}
                                    onChange={(v) => updatePersonalInfo("fullName", v)}
                                    placeholder="Your Name"
                                    displayComponent={<Typewriter text={spaceLetters(personalInfo.fullName || "YOUR NAME")} />}
                                />
                            </h1>

                            {/* Headline/Title */}
                            <p
                                className="text-[#2c4a7c] tracking-widest uppercase mb-3"
                                style={styles.headline}
                            >
                                <EditableText
                                    value={data.targetJob || ""}
                                    onChange={(v) => onUpdate?.({ targetJob: v })}
                                    placeholder="Your Title | Specialty"
                                    displayComponent={<Typewriter text={data.targetJob || "YOUR TITLE | SPECIALTY"} />}
                                />
                            </p>

                            {/* Contact info row */}
                            <p className="text-gray-600 flex items-center flex-wrap gap-1" style={styles.detail}>
                                <span className="text-blue-600">
                                    <EditableText
                                        value={personalInfo.email}
                                        onChange={(v) => updatePersonalInfo("email", v)}
                                        placeholder="email@example.com"
                                        displayComponent={<Typewriter text={personalInfo.email || ""} />}
                                    />
                                </span>
                                {personalInfo.location && <span> | </span>}
                                <EditableText
                                    value={personalInfo.location}
                                    onChange={(v) => updatePersonalInfo("location", v)}
                                    placeholder="City, Country"
                                    displayComponent={<Typewriter text={personalInfo.location || ""} />}
                                />
                                {personalInfo.phone && <span> | </span>}
                                <EditableText
                                    value={personalInfo.phone}
                                    onChange={(v) => updatePersonalInfo("phone", v)}
                                    placeholder="+1 234 567 890"
                                    displayComponent={<Typewriter text={personalInfo.phone || ""} />}
                                />
                            </p>
                        </div>

                        {/* Profile photo placeholder */}
                        <div
                            className="w-20 h-20 rounded-full bg-gray-200 border-2 border-[#2c4a7c] flex items-center justify-center text-gray-400 text-xs ml-4 shrink-0"
                        >
                            Photo
                        </div>
                    </div>

                    {/* Education */}
                    {education.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionDivider title="Education" />
                            <div>
                                {education.map((edu, index) => (
                                    <div key={edu.id} className="flex justify-between items-start" style={styles.entryMargin}>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900" style={styles.entryTitle}>
                                                <EditableText
                                                    value={edu.institution}
                                                    onChange={(v) => updateEducation(index, { institution: v })}
                                                    placeholder="Institution"
                                                    displayComponent={<Typewriter text={edu.institution} />}
                                                />
                                            </div>
                                            <div className="text-gray-600 italic" style={styles.detail}>
                                                <EditableText
                                                    value={`${edu.degree} in ${edu.field}`}
                                                    onChange={(v) => {
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
                                        <div className="text-right text-gray-600 shrink-0 ml-4" style={styles.detail}>
                                            <div>
                                                <Typewriter text={edu.location || ""} />
                                            </div>
                                            <div>
                                                <Typewriter text={formatDateRange(edu.startDate, edu.endDate)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Corporate Experience */}
                    {experience.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionDivider title="Corporate Experience" />
                            <div>
                                {experience.map((exp, index) => (
                                    <div key={exp.id} style={styles.entryMargin}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-gray-900" style={styles.entryTitle}>
                                                    <span className="font-normal">{exp.title}</span>
                                                    <span className="mx-1">|</span>
                                                    {exp.companyUrl ? (
                                                        <a
                                                            href={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 font-bold underline"
                                                        >
                                                            <EditableText
                                                                value={exp.company}
                                                                onChange={(v) => updateExperience(index, { company: v })}
                                                                placeholder="Company"
                                                                displayComponent={<Typewriter text={exp.company} />}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <span className="font-bold">
                                                            <EditableText
                                                                value={exp.company}
                                                                onChange={(v) => updateExperience(index, { company: v })}
                                                                placeholder="Company"
                                                                displayComponent={<Typewriter text={exp.company} />}
                                                            />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right text-gray-600 shrink-0 ml-4" style={styles.detail}>
                                                <Typewriter text={`${exp.location || ""} | ${formatDateRange(exp.startDate, exp.endDate, exp.current)}`} />
                                            </div>
                                        </div>

                                        {exp.bullets.length > 0 && (
                                            <ul className="list-none ml-4 text-gray-700" style={styles.detail}>
                                                {exp.bullets.map((bullet, bulletIndex) => (
                                                    <li key={bulletIndex} className="flex items-start" style={styles.bulletMargin}>
                                                        <span className="mr-2 text-gray-500">•</span>
                                                        <span className="flex-1">
                                                            <EditableText
                                                                value={bullet}
                                                                onChange={(v) => updateBullet(index, bulletIndex, v)}
                                                                placeholder="Achievement..."
                                                                multiline
                                                                displayComponent={<Typewriter text={bullet} speed={2} />}
                                                            />
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Experience */}
                    {projects.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionDivider title="Projects Experience" />
                            <div>
                                {projects.map((project, index) => (
                                    <div key={project.id} style={styles.entryMargin}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1 min-w-0" style={styles.entryTitle}>
                                                <span className="font-normal">Founder and Developer</span>
                                                <span className="mx-1">|</span>
                                                {project.url ? (
                                                    <a
                                                        href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 font-bold underline"
                                                    >
                                                        <Typewriter text={project.name} />
                                                    </a>
                                                ) : (
                                                    <span className="font-bold">
                                                        <Typewriter text={project.name} />
                                                    </span>
                                                )}
                                                <span className="text-gray-500 font-normal ml-1">(startup prototype)</span>
                                            </div>
                                            <div className="text-right text-gray-600 shrink-0 ml-4" style={styles.detail}>
                                                <Typewriter text={formatDateRange(project.startDate, project.endDate)} />
                                            </div>
                                        </div>

                                        <ul className="list-none ml-4 text-gray-700" style={styles.detail}>
                                            <li className="flex items-start" style={styles.bulletMargin}>
                                                <span className="mr-2 text-gray-500">•</span>
                                                <span className="flex-1">
                                                    <EditableText
                                                        value={project.description}
                                                        onChange={(v) => updateProject(index, { description: v })}
                                                        placeholder="Project description..."
                                                        multiline
                                                        displayComponent={<Typewriter text={project.description} speed={2} />}
                                                    />
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technical Skills */}
                    {skills.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionDivider title="Technical Skills" />
                            <div style={styles.detail}>
                                {groupedSkills.map(([category, categorySkills]) => (
                                    <div key={category} style={styles.bulletMargin}>
                                        <span className="font-bold text-gray-900">{category}:</span>
                                        <span className="text-gray-700 ml-1">
                                            {categorySkills.join(", ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    {(certifications.length > 0 || (languages && languages.length > 0)) && (
                        <div style={styles.sectionMargin}>
                            <SectionDivider title="Additional Information" />

                            {/* Certifications */}
                            {certifications.length > 0 && (
                                <div style={styles.detail}>
                                    <div className="font-bold text-gray-900 mb-1">Certifications:</div>
                                    <ul className="list-none ml-4">
                                        {certifications.map((cert, index) => (
                                            <li key={cert.id} className="flex items-start" style={styles.bulletMargin}>
                                                <span className="mr-2 text-gray-500">•</span>
                                                <span>
                                                    <Typewriter text={`${cert.name} (${cert.issueDate})`} />
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Languages */}
                            {languages && languages.length > 0 && (
                                <div style={styles.detail} className="mt-2">
                                    <span className="font-bold text-gray-900">Languages:</span>
                                    <span className="text-gray-700 ml-1">
                                        <Typewriter
                                            text={languages.map(lang => `${lang.language} (${lang.level})`).join(" and ")}
                                        />
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SequentialAnimationProvider>
        </div>
    );
}
