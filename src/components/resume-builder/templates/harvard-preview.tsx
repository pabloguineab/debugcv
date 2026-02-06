"use client";

import { useMemo, useCallback } from "react";
import { Typewriter, SequentialAnimationProvider } from "@/components/ui/sequential-typewriter";
import { EditableText } from "../editable-text";
import { ResumeData, Experience, Education, Project, Certification } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Link2, CheckCircle2, Github } from "lucide-react";
import { calculateStyleConfig } from "@/lib/resume-styles";
import { formatSkillName } from "@/lib/skill-formatter";

interface HarvardPreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    onUpdate?: (updates: Partial<ResumeData>) => void;
    animate?: boolean;
}

// Primary accent color - professional blue
const ACCENT_COLOR = "#2563eb";

export function HarvardPreview({ data, onFieldClick, onUpdate, animate = false }: HarvardPreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    // Calculate dynamic styles based on content density
    const styleConfig = useMemo(() => calculateStyleConfig(data), [data]);

    // Scale factor for web preview
    const scale = 1.25;

    // Primary accent color - professional blue
    const accentColor = data.accentColor || "#2563eb";

    const styles = useMemo(() => ({
        container: {
            padding: `${styleConfig.pagePaddingTop * scale}px ${styleConfig.pagePadding * scale}px ${styleConfig.pagePaddingBottom * scale}px`,
        },
        name: {
            fontSize: `${styleConfig.nameFontSize * scale}px`,
            lineHeight: 1.1,
        },
        headline: {
            fontSize: `${styleConfig.detailFontSize * scale * 1.15}px`,
        },
        sectionTitle: {
            fontSize: `${styleConfig.sectionTitleSize * scale}px`,
            marginBottom: `${styleConfig.sectionMarginBottom * scale * 0.6}px`,
        },
        entryTitle: {
            fontSize: `${styleConfig.entryTitleSize * scale}px`,
        },
        detail: {
            fontSize: `${styleConfig.detailFontSize * scale}px`,
            lineHeight: styleConfig.lineHeight,
        },
        smallDetail: {
            fontSize: `${(styleConfig.detailFontSize - 0.5) * scale}px`,
        },
        entryMargin: {
            marginBottom: `${styleConfig.entryMarginBottom * scale}px`,
        },
        sectionMargin: {
            marginTop: `${styleConfig.sectionMarginTop * scale}px`,
            marginBottom: `${styleConfig.sectionMarginBottom * scale}px`,
        },
        bulletMargin: {
            marginBottom: `${styleConfig.bulletMarginBottom * scale}px`,
        },
        contactFontSize: {
            fontSize: `${styleConfig.detailFontSize * scale * 0.95}px`,
        },
        skillTag: {
            fontSize: `${(styleConfig.detailFontSize - 0.5) * scale}px`,
            padding: `${3 * scale}px ${8 * scale}px`,
        },
    }), [styleConfig, scale]);

    // Auto-generate headline
    const generatedHeadline = useMemo(() => {
        if (data.targetJob) return data.targetJob;
        if (experience.length > 0 && experience[0].title) return experience[0].title;
        return "";
    }, [data.targetJob, experience]);

    // Helper to format date ranges
    const formatDateRange = useCallback((startDate?: string, endDate?: string, current?: boolean) => {
        const end = current ? "Present" : (endDate || "");
        const start = startDate || "";
        if (start && end) return `${start} - ${end}`;
        if (start) return start;
        if (end) return end;
        return "";
    }, []);

    // Update handlers
    const updatePersonalInfo = useCallback((field: string, value: string) => {
        onUpdate?.({
            personalInfo: { ...personalInfo, [field]: value }
        });
    }, [onUpdate, personalInfo]);

    const updateSummary = useCallback((value: string) => {
        onUpdate?.({ summary: value });
    }, [onUpdate]);

    const updateExperience = useCallback((index: number, updates: Partial<Experience>) => {
        const newExperience = [...experience];
        newExperience[index] = { ...newExperience[index], ...updates };
        onUpdate?.({ experience: newExperience });
    }, [onUpdate, experience]);

    const updateEducation = useCallback((index: number, updates: Partial<Education>) => {
        const newEducation = [...education];
        newEducation[index] = { ...newEducation[index], ...updates };
        onUpdate?.({ education: newEducation });
    }, [onUpdate, education]);

    const updateProject = useCallback((index: number, updates: Partial<Project>) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], ...updates };
        onUpdate?.({ projects: newProjects });
    }, [onUpdate, projects]);

    const updateBullet = useCallback((expIndex: number, bulletIndex: number, value: string) => {
        const newExperience = [...experience];
        const newBullets = [...newExperience[expIndex].bullets];
        newBullets[bulletIndex] = value;
        newExperience[expIndex] = { ...newExperience[expIndex], bullets: newBullets };
        onUpdate?.({ experience: newExperience });
    }, [onUpdate, experience]);

    // Categorize skills - expanded keywords
    const categorizedSkills = useMemo(() => {
        const techKeywords = ['python', 'javascript', 'react', 'sql', 'tensorflow', 'pytorch', 'aws', 'docker', 'git', 'numpy', 'pandas', 'matplotlib', 'tableau', 'excel', 'r', 'matlab', 'spark', 'hadoop', 'llm', 'nlp', 'api', 'mongodb', 'postgresql', 'nosql', 'flask', 'fastapi', 'streamlit', 'langchain', 'keras', 'scikit', 'java', 'c++', 'typescript', 'node', 'vue', 'angular', 'html', 'css', 'linux', 'azure', 'gcp', 'kubernetes', 'jenkins', 'ci/cd', 'power bi', 'd3', 'plotly', 'scipy', 'pyspark', 'qdrant', 'chromadb', 'pinecone', 'hugging', 'transformers', 'openai', 'anthropic', 'gradio', 'chainlit', 'dialogflow', 'sagemaker', 'lambda', 'ec2', 's3', 'bash', 'shell', 'scripting', 'google-cloud', 'langgraph', 'qdrant', 'chromadb'];

        const technical = skills.filter(skill =>
            techKeywords.some(k => skill.toLowerCase().includes(k))
        );
        const general = skills.filter(skill =>
            !techKeywords.some(k => skill.toLowerCase().includes(k))
        );

        return { technical, general };
    }, [skills]);

    // Section Header Component with dynamic styles
    const SectionHeader = useMemo(() => {
        return function SectionHeaderInner({ title }: { title: string }) {
            return (
                <div style={styles.sectionMargin}>
                    <h3
                        className="font-bold uppercase tracking-wider"
                        style={{ ...styles.sectionTitle, color: accentColor }}
                    >
                        {title}
                    </h3>
                    <div className="h-[2px] mt-1" style={{ backgroundColor: accentColor }} />
                </div>
            );
        };
    }, [styles.sectionTitle, styles.sectionMargin, accentColor]);

    // Skill Tag with dynamic styles
    const SkillTag = useMemo(() => {
        return function SkillTagInner({ skill }: { skill: string }) {
            return (
                <span
                    className="inline-block font-medium rounded mr-1.5 mb-1.5"
                    style={{
                        ...styles.skillTag,
                        backgroundColor: `${accentColor}15`,
                        color: accentColor
                    }}
                >
                    {formatSkillName(skill)}
                </span>
            );
        };
    }, [styles.skillTag, accentColor]);

    return (
        <div
            className="bg-white rounded-lg mx-auto border border-gray-200 shadow-sm overflow-hidden"
            style={{
                width: "100%",
                maxWidth: "800px",
                minHeight: "1100px"
            }}
            data-resume-preview="true"
        >
            <SequentialAnimationProvider animate={animate}>
                <div style={styles.container}>
                    {/* Header - Full Width */}
                    <div className="pb-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 text-center">
                                {/* Name */}
                                <h1
                                    className="font-bold tracking-wide"
                                    style={{ ...styles.name, color: accentColor }}
                                >
                                    <EditableText
                                        value={personalInfo.fullName}
                                        onChange={(v) => updatePersonalInfo("fullName", v)}
                                        placeholder="Your Name"
                                        displayComponent={<Typewriter text={personalInfo.fullName || "Your Name"} />}
                                    />
                                </h1>

                                {/* Headline/Title */}
                                {generatedHeadline && (
                                    <p className="text-gray-600 mt-1" style={styles.headline}>
                                        <EditableText
                                            value={generatedHeadline}
                                            onChange={(v) => onUpdate?.({ targetJob: v })}
                                            placeholder="Your Title"
                                            displayComponent={<Typewriter text={generatedHeadline} />}
                                        />
                                    </p>
                                )}
                            </div>

                            {/* Photo */}
                            {data.showPhoto && (
                                <div className="shrink-0 flex items-center justify-center">
                                    <img
                                        src={personalInfo.pictureUrl || "https://avatar.vercel.sh/leerob"}
                                        alt="Profile"
                                        className="rounded-full object-cover border-2"
                                        style={{
                                            width: `${80 * scale}px`,
                                            height: `${80 * scale}px`,
                                            borderColor: accentColor
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-[3px] mt-3" style={{ backgroundColor: accentColor }} />

                        {/* Contact Info Row */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-gray-600" style={styles.contactFontSize}>
                            {personalInfo.phone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                    <EditableText
                                        value={personalInfo.phone}
                                        onChange={(v) => updatePersonalInfo("phone", v)}
                                        placeholder="+1 234 567 890"
                                        displayComponent={<Typewriter text={personalInfo.phone} />}
                                    />
                                </span>
                            )}
                            {personalInfo.email && (
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                    <span style={{ color: accentColor }}>
                                        <EditableText
                                            value={personalInfo.email}
                                            onChange={(v) => updatePersonalInfo("email", v)}
                                            placeholder="email@example.com"
                                            displayComponent={<Typewriter text={personalInfo.email} />}
                                        />
                                    </span>
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span className="flex items-center gap-1.5">
                                    <Linkedin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                    <a
                                        href={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: accentColor }}
                                        className="hover:underline"
                                    >
                                        <Typewriter text={personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')} />
                                    </a>
                                </span>
                            )}
                            {personalInfo.github && (
                                <span className="flex items-center gap-1.5">
                                    <Github className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                    <a
                                        href={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: accentColor }}
                                        className="hover:underline"
                                    >
                                        <Typewriter text={personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')} />
                                    </a>
                                </span>
                            )}
                            {personalInfo.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                    <EditableText
                                        value={personalInfo.location}
                                        onChange={(v) => updatePersonalInfo("location", v)}
                                        placeholder="City, Country"
                                        displayComponent={<Typewriter text={personalInfo.location} />}
                                    />
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="flex gap-4">
                        {/* Left Column - 55% - Summary, Experience & Education */}
                        <div className="w-[55%] pr-3 border-r border-gray-200">
                            {/* Summary */}
                            {summary && (
                                <div>
                                    <SectionHeader title="Summary" />
                                    <p className="text-gray-700 leading-relaxed" style={styles.detail}>
                                        <EditableText
                                            value={summary}
                                            onChange={updateSummary}
                                            placeholder="Professional summary..."
                                            multiline
                                            displayComponent={<Typewriter text={summary} speed={2} />}
                                        />
                                    </p>
                                </div>
                            )}

                            {/* Experience */}
                            {experience.length > 0 && (
                                <div>
                                    <SectionHeader title="Experience" />
                                    {experience.map((exp, index) => (
                                        <div key={exp.id} style={styles.entryMargin}>
                                            {/* Company & Title Row */}
                                            {/* Company & Title Row */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <span className="font-bold text-gray-900" style={styles.entryTitle}>
                                                        <EditableText
                                                            value={exp.title}
                                                            onChange={(v) => updateExperience(index, { title: v })}
                                                            placeholder="Job Title"
                                                            displayComponent={<Typewriter text={exp.title} />}
                                                        />
                                                    </span>
                                                    <span className="text-gray-500 mx-1.5" style={styles.detail}>|</span>
                                                    {exp.companyUrl ? (
                                                        <a
                                                            href={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-semibold hover:underline"
                                                            style={{ ...styles.entryTitle, color: accentColor }}
                                                        >
                                                            <EditableText
                                                                value={exp.company}
                                                                onChange={(v) => updateExperience(index, { company: v })}
                                                                placeholder="Company"
                                                                displayComponent={<Typewriter text={exp.company} />}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <span className="font-semibold" style={{ ...styles.entryTitle, color: accentColor }}>
                                                            <EditableText
                                                                value={exp.company}
                                                                onChange={(v) => updateExperience(index, { company: v })}
                                                                placeholder="Company"
                                                                displayComponent={<Typewriter text={exp.company} />}
                                                            />
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-500 shrink-0 ml-3" style={styles.smallDetail}>
                                                    {exp.location && <>{exp.location} | </>}
                                                    <Typewriter text={formatDateRange(exp.startDate, exp.endDate, exp.current)} />
                                                </span>
                                            </div>

                                            {/* Bullet Points */}
                                            {exp.bullets.length > 0 && (
                                                <ul className="mt-2 ml-3 space-y-1">
                                                    {exp.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                                                        <li key={bulletIndex} className="flex items-start text-gray-700" style={styles.bulletMargin}>
                                                            <CheckCircle2
                                                                className="w-3 h-3 mr-2 mt-0.5 shrink-0"
                                                                style={{ color: accentColor }}
                                                            />
                                                            <span className="leading-relaxed" style={styles.detail}>
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
                            )}

                            {/* Education - Now on left column with Experience */}
                            {education.length > 0 && (
                                <div>
                                    <SectionHeader title="Education" />
                                    {education.map((edu, index) => (
                                        <div key={edu.id} style={styles.entryMargin}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <span className="font-bold text-gray-900" style={styles.entryTitle}>
                                                        <EditableText
                                                            value={edu.institution}
                                                            onChange={(v) => updateEducation(index, { institution: v })}
                                                            placeholder="Institution"
                                                            displayComponent={<Typewriter text={edu.institution} />}
                                                        />
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 shrink-0 ml-3" style={styles.smallDetail}>
                                                    <Typewriter text={formatDateRange(edu.startDate, edu.endDate)} />
                                                </span>
                                            </div>
                                            <div className="text-gray-600 italic" style={styles.detail}>
                                                <EditableText
                                                    value={`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`}
                                                    onChange={(v) => {
                                                        const parts = v.split(" in ");
                                                        updateEducation(index, {
                                                            degree: parts[0] || "",
                                                            field: parts.slice(1).join(" in ") || ""
                                                        });
                                                    }}
                                                    placeholder="Degree in Field"
                                                    displayComponent={<Typewriter text={`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`} />}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - 45% - Skills, Projects, Certs, Languages */}
                        <div className="w-[45%]">
                            {/* Technical Skills */}
                            {categorizedSkills.technical.length > 0 && (
                                <div>
                                    <SectionHeader title="Technical Skills" />
                                    <div className="flex flex-wrap">
                                        {categorizedSkills.technical.map((skill, index) => (
                                            <SkillTag key={index} skill={skill} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Other Skills */}
                            {categorizedSkills.general.length > 0 && (
                                <div>
                                    <SectionHeader title="Other Skills" />
                                    <div className="flex flex-wrap">
                                        {categorizedSkills.general.map((skill, index) => (
                                            <SkillTag key={index} skill={skill} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {projects.length > 0 && (
                                <div>
                                    <SectionHeader title="Projects" />
                                    {projects.map((project, index) => (
                                        <div key={project.id} style={styles.entryMargin}>
                                            {/* Project Name */}
                                            <div>
                                                {project.url ? (
                                                    <a
                                                        href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-bold hover:underline"
                                                        style={{ ...styles.entryTitle, color: accentColor }}
                                                    >
                                                        <Typewriter text={project.name} />
                                                    </a>
                                                ) : (
                                                    <span className="font-bold" style={{ ...styles.entryTitle, color: accentColor }}>
                                                        <Typewriter text={project.name} />
                                                    </span>
                                                )}
                                                {project.technologies.length > 0 && (
                                                    <span className="text-gray-500 ml-1.5" style={styles.smallDetail}>
                                                        ({project.technologies.slice(0, 3).join(", ")})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-700 mt-1 leading-relaxed" style={styles.detail}>
                                                <EditableText
                                                    value={project.description}
                                                    onChange={(v) => updateProject(index, { description: v })}
                                                    placeholder="Project description..."
                                                    multiline
                                                    displayComponent={<Typewriter text={project.description} speed={2} />}
                                                />
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Certifications */}
                            {certifications.length > 0 && (
                                <div>
                                    <SectionHeader title="Certifications" />
                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="text-gray-700" style={{ ...styles.detail, marginBottom: `${styleConfig.bulletMarginBottom * scale * 1.5}px` }}>
                                            <span className="font-semibold" style={{ color: accentColor }}>
                                                <Typewriter text={cert.name} />
                                            </span>
                                            {cert.issuer && (
                                                <span className="text-gray-500"> - {cert.issuer}</span>
                                            )}
                                            {cert.issueDate && (
                                                <span className="text-gray-400"> ({cert.issueDate})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Languages */}
                            {languages && languages.length > 0 && (
                                <div>
                                    <SectionHeader title="Languages" />
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {languages.map((lang, index) => (
                                            <div key={index} style={styles.detail}>
                                                <span className="font-semibold text-gray-800">{lang.language}</span>
                                                <span className="text-gray-500 ml-1.5">{lang.level.charAt(0).toUpperCase() + lang.level.slice(1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SequentialAnimationProvider>
        </div>
    );
}
