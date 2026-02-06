"use client";

import { useMemo } from "react";
import { Typewriter, SequentialAnimationProvider } from "@/components/ui/sequential-typewriter";
import { EditableText } from "../editable-text";
import { ResumeData, Experience, Education, Project, Certification } from "@/types/resume";
import { calculateStyleConfig } from "@/lib/resume-styles";
import { formatSkillName } from "@/lib/skill-formatter";

interface ModernPreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    onUpdate?: (updates: Partial<ResumeData>) => void;
    animate?: boolean;
}

export function ModernPreview({ data, onFieldClick, onUpdate, animate = false }: ModernPreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    const styleConfig = useMemo(() => calculateStyleConfig(data), [data]);
    const scale = 1.2;

    const styles = useMemo(() => ({
        container: {
            padding: `${styleConfig.pagePaddingTop * scale}px ${styleConfig.pagePadding * scale}px ${styleConfig.pagePaddingBottom * scale}px`,
        },
        name: {
            fontSize: `${styleConfig.nameFontSize * scale * 1.15}px`,
        },
        headline: {
            fontSize: `${styleConfig.detailFontSize * scale}px`,
        },
        sectionTitle: {
            fontSize: `${styleConfig.sectionTitleSize * scale * 0.85}px`,
            marginTop: `${styleConfig.sectionMarginTop * scale}px`,
            marginBottom: `${styleConfig.sectionMarginBottom * scale * 0.6}px`,
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

    // Accent color
    const accentColor = data.accentColor || "#1e40af";

    // Auto-generate headline based on targetJob, first experience, or default
    const generatedHeadline = useMemo(() => {
        if (data.targetJob) return data.targetJob;
        if (experience.length > 0 && experience[0].title) return experience[0].title;
        return ""; // No fallback - don't show if we don't have data
    }, [data.targetJob, experience]);

    // Helper to format date ranges
    const formatDateRange = (startDate?: string, endDate?: string, current?: boolean) => {
        const end = current ? "Present" : (endDate || "");
        const start = startDate || "";
        if (start && end) return `${start} - ${end}`;
        if (start) return start;
        if (end) return end;
        return "";
    };

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

    // Group skills by category
    const groupedSkills = useMemo(() => {
        const groups: Record<string, string[]> = {
            "Programming Languages": [],
            "Machine Learning": [],
            "Web Development": [],
            "Cloud & DevOps": [],
            "Data Analytics": [],
            "Business Intelligence": [],
            "Other": []
        };

        const mlKeywords = ['tensorflow', 'pytorch', 'keras', 'ml', 'ai', 'neural', 'deep learning', 'nlp', 'llm', 'hugging', 'transformers', 'langchain', 'gensim', 'spacy', 'nltk', 'qdrant', 'chromadb', 'pinecone', 'llamaindex', 'langsmith', 'langgraph'];
        const webKeywords = ['react', 'vue', 'angular', 'node', 'next', 'html', 'css', 'javascript', 'typescript', 'flask', 'fastapi', 'streamlit', 'gradio', 'chainlit'];
        const cloudKeywords = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'devops', 'lambda', 's3', 'ec2', 'sagemaker', 'dialogflow'];
        const dataKeywords = ['pandas', 'numpy', 'scipy', 'plotly', 'matplotlib', 'hadoop', 'spark', 'pyspark'];
        const biKeywords = ['tableau', 'power bi', 'd3'];
        const langKeywords = ['python', 'javascript', 'java', 'c++', 'c#', 'r', 'matlab', 'bash', 'shell', 'sql'];

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
            } else if (biKeywords.some(k => lower.includes(k))) {
                groups["Business Intelligence"].push(skill);
            } else if (dataKeywords.some(k => lower.includes(k))) {
                groups["Data Analytics"].push(skill);
            } else {
                groups["Other"].push(skill);
            }
        });

        return Object.entries(groups).filter(([_, skills]) => skills.length > 0);
    }, [skills]);

    // Memoized section header to prevent re-creation on each render
    const SectionHeader = useMemo(() => {
        return function SectionHeaderInner({ title }: { title: string }) {
            return (
                <div className="flex items-center gap-3 mb-2" style={styles.sectionTitle}>
                    <div className="h-[2px] flex-1" style={{ backgroundColor: accentColor }} />
                    <span
                        className="font-semibold uppercase tracking-wider px-2"
                        style={{ color: accentColor }}
                    >
                        {title}
                    </span>
                    <div className="h-[2px] flex-1" style={{ backgroundColor: accentColor }} />
                </div>
            );
        };
    }, [styles.sectionTitle, accentColor]);

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
                        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
                        ...styles.container
                    }}
                >
                    {/* Header */}
                    <div className={`pb-4 mb-4 ${data.showPhoto ? "flex flex-row items-center text-left gap-6" : "text-center"}`}>
                        {/* Photo - Left aligned for Modern template */}
                        {data.showPhoto && (
                            <div className="shrink-0">
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => document.getElementById('modern-preview-photo-upload')?.click()}
                                >
                                    <input
                                        id="modern-preview-photo-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    if (typeof reader.result === "string") {
                                                        const event = {
                                                            target: { value: reader.result }
                                                        };
                                                        updatePersonalInfo("pictureUrl", reader.result);
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <img
                                        src={personalInfo.pictureUrl || "https://avatar.vercel.sh/leerob"}
                                        alt="Profile"
                                        className="rounded-full object-cover border-2"
                                        style={{
                                            width: `${100 * scale}px`,
                                            height: `${100 * scale}px`,
                                            borderColor: accentColor
                                        }}
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" x2="12" y1="3" y2="15" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1">
                            <h1
                                className="font-bold mb-1"
                                style={{ ...styles.name, color: accentColor }}
                            >
                                <EditableText
                                    value={personalInfo.fullName}
                                    onChange={(v) => updatePersonalInfo("fullName", v)}
                                    placeholder="Your Name"
                                    displayComponent={<Typewriter text={personalInfo.fullName || "Your Name"} />}
                                />
                            </h1>

                            {/* Title/Headline - auto-generated from targetJob or first experience */}
                            {generatedHeadline && (
                                <p
                                    className="text-gray-600 uppercase tracking-wide mb-2"
                                    style={styles.headline}
                                >
                                    <EditableText
                                        value={generatedHeadline}
                                        onChange={(v) => onUpdate?.({ targetJob: v })}
                                        placeholder="Your Title"
                                        displayComponent={<Typewriter text={generatedHeadline} />}
                                    />
                                </p>
                            )}

                            {/* Contact info */}
                            <div className={`flex flex-wrap gap-x-3 gap-y-1 text-gray-600 ${data.showPhoto ? "" : "justify-center"}`} style={styles.detail}>
                                {personalInfo.email && (
                                    <span style={{ color: accentColor }}>
                                        <EditableText
                                            value={personalInfo.email}
                                            onChange={(v) => updatePersonalInfo("email", v)}
                                            placeholder="email@example.com"
                                            displayComponent={<Typewriter text={personalInfo.email} />}
                                        />
                                    </span>
                                )}
                                {personalInfo.location && (
                                    <>
                                        <span className="text-gray-400">|</span>
                                        <EditableText
                                            value={personalInfo.location}
                                            onChange={(v) => updatePersonalInfo("location", v)}
                                            placeholder="City, Country"
                                            displayComponent={<Typewriter text={personalInfo.location} />}
                                        />
                                    </>
                                )}
                                {personalInfo.phone && (
                                    <>
                                        <span className="text-gray-400">|</span>
                                        <EditableText
                                            value={personalInfo.phone}
                                            onChange={(v) => updatePersonalInfo("phone", v)}
                                            placeholder="+1 234 567 890"
                                            displayComponent={<Typewriter text={personalInfo.phone} />}
                                        />
                                    </>
                                )}
                                {personalInfo.linkedin && (
                                    <>
                                        <span className="text-gray-400">|</span>
                                        <a
                                            href={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: accentColor }}
                                            className="hover:underline"
                                        >
                                            <Typewriter text="LinkedIn" />
                                        </a>
                                    </>
                                )}
                                {personalInfo.github && (
                                    <>
                                        <span className="text-gray-400">|</span>
                                        <a
                                            href={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: accentColor }}
                                            className="hover:underline"
                                        >
                                            <Typewriter text="GitHub" />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    {summary && (
                        <div style={styles.sectionMargin}>
                            <SectionHeader title="Professional Summary" />
                            <div className="text-gray-700 leading-relaxed" style={styles.detail}>
                                <EditableText
                                    value={summary}
                                    onChange={updateSummary}
                                    placeholder="Professional summary..."
                                    multiline
                                    displayComponent={<Typewriter text={summary} speed={2} />}
                                />
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionHeader title="Education" />
                            {education.map((edu, index) => (
                                <div key={edu.id} className="flex justify-between items-start" style={styles.entryMargin}>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900" style={styles.entryTitle}>
                                            <EditableText
                                                value={edu.institution}
                                                onChange={(v) => updateEducation(index, { institution: v })}
                                                placeholder="Institution"
                                                displayComponent={<Typewriter text={edu.institution} />}
                                            />
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
                                    <div className="text-right text-gray-600 shrink-0 ml-4" style={styles.detail}>
                                        <div><Typewriter text={edu.location || ""} /></div>
                                        <div><Typewriter text={formatDateRange(edu.startDate, edu.endDate)} /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionHeader title="Professional Experience" />
                            {experience.map((exp, index) => (
                                <div key={exp.id} style={styles.entryMargin}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1">
                                            <div style={styles.entryTitle}>
                                                <span className="font-semibold text-gray-900">{exp.title}</span>
                                                <span className="text-gray-500 mx-2">|</span>
                                                {exp.companyUrl ? (
                                                    <a
                                                        href={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold hover:underline"
                                                        style={{ color: accentColor }}
                                                    >
                                                        <EditableText
                                                            value={exp.company}
                                                            onChange={(v) => updateExperience(index, { company: v })}
                                                            placeholder="Company"
                                                            displayComponent={<Typewriter text={exp.company} />}
                                                        />
                                                    </a>
                                                ) : (
                                                    <span className="font-semibold" style={{ color: accentColor }}>
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
                                            <Typewriter text={`${exp.location || ""}${exp.location ? " | " : ""}${formatDateRange(exp.startDate, exp.endDate, exp.current)}`} />
                                        </div>
                                    </div>

                                    {exp.bullets.length > 0 && (
                                        <ul className="ml-4 text-gray-700" style={styles.detail}>
                                            {exp.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                                                <li key={bulletIndex} className="flex items-start" style={styles.bulletMargin}>
                                                    <span className="mr-2 text-gray-400">•</span>
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
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionHeader title="Projects" />
                            {projects.map((project, index) => (
                                <div key={project.id} style={styles.entryMargin}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1" style={styles.entryTitle}>
                                            {project.url ? (
                                                <a
                                                    href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold hover:underline"
                                                    style={{ color: accentColor }}
                                                >
                                                    <Typewriter text={project.name} />
                                                </a>
                                            ) : (
                                                <span className="font-semibold" style={{ color: accentColor }}>
                                                    <Typewriter text={project.name} />
                                                </span>
                                            )}
                                            {project.technologies.length > 0 && (
                                                <span className="text-gray-500 font-normal ml-2" style={{ fontSize: `${styleConfig.detailFontSize * scale * 0.9}px` }}>
                                                    ({project.technologies.slice(0, 4).join(", ")})
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right text-gray-600 shrink-0 ml-4" style={styles.detail}>
                                            <Typewriter text={formatDateRange(project.startDate, project.endDate)} />
                                        </div>
                                    </div>

                                    <div className="ml-4 text-gray-700" style={styles.detail}>
                                        <div className="flex items-start" style={styles.bulletMargin}>
                                            <span className="mr-2 text-gray-400">•</span>
                                            <span className="flex-1">
                                                <EditableText
                                                    value={project.description}
                                                    onChange={(v) => updateProject(index, { description: v })}
                                                    placeholder="Project description..."
                                                    multiline
                                                    displayComponent={<Typewriter text={project.description} speed={2} />}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Technical Skills */}
                    {skills.length > 0 && (
                        <div style={styles.sectionMargin}>
                            <SectionHeader title="Technical Skills" />
                            <div style={styles.detail}>
                                {groupedSkills.map(([category, categorySkills]) => (
                                    <div key={category} className="mb-1">
                                        <span className="font-semibold text-gray-900">{category}: </span>
                                        <span className="text-gray-700">{categorySkills.map(s => formatSkillName(s)).join(", ")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications & Languages */}
                    {(certifications.length > 0 || (languages && languages.length > 0)) && (
                        <div style={styles.sectionMargin}>
                            <SectionHeader title="Additional Information" />
                            <div style={styles.detail}>
                                {certifications.length > 0 && (
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-900">Certifications: </span>
                                        <span className="text-gray-700">
                                            {certifications.map((cert, i) => (
                                                <span key={cert.id}>
                                                    {cert.name} ({cert.issueDate})
                                                    {i < certifications.length - 1 && " • "}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                )}
                                {languages && languages.length > 0 && (
                                    <div>
                                        <span className="font-semibold text-gray-900">Languages: </span>
                                        <span className="text-gray-700">
                                            {languages.map(lang => `${lang.language} (${lang.level.charAt(0).toUpperCase() + lang.level.slice(1)})`).join(" • ")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </SequentialAnimationProvider>
        </div>
    );
}
