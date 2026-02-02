"use client";

import { useMemo } from "react";
import { Typewriter, SequentialAnimationProvider } from "@/components/ui/sequential-typewriter";
import { EditableText } from "../editable-text";
import { ResumeData, Experience, Education, Project, Certification } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Calendar, Link2, CheckCircle2 } from "lucide-react";

interface HarvardPreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    onUpdate?: (updates: Partial<ResumeData>) => void;
    animate?: boolean;
}

// Primary accent color - professional blue
const ACCENT_COLOR = "#2563eb";

// Section Header Component - defined outside to prevent re-creation on each render
const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-2">
        <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: ACCENT_COLOR }}
        >
            {title}
        </h3>
        <div className="h-[2px] mt-1" style={{ backgroundColor: ACCENT_COLOR }} />
    </div>
);

// Skill Tag Component - defined outside to prevent re-creation on each render
const SkillTag = ({ skill }: { skill: string }) => (
    <span
        className="inline-block px-2 py-0.5 text-[9px] font-medium rounded mr-1 mb-1"
        style={{
            backgroundColor: `${ACCENT_COLOR}15`,
            color: ACCENT_COLOR
        }}
    >
        {skill}
    </span>
);

export function HarvardPreview({ data, onFieldClick, onUpdate, animate = false }: HarvardPreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    // Use the global accent color constant
    const accentColor = ACCENT_COLOR;

    // Auto-generate headline
    const generatedHeadline = useMemo(() => {
        if (data.targetJob) return data.targetJob;
        if (experience.length > 0 && experience[0].title) return experience[0].title;
        return "";
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

    const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
        const newExperience = [...experience];
        const newBullets = [...newExperience[expIndex].bullets];
        newBullets[bulletIndex] = value;
        newExperience[expIndex] = { ...newExperience[expIndex], bullets: newBullets };
        onUpdate?.({ experience: newExperience });
    };

    // Categorize skills for display
    const generalSkills = useMemo(() => {
        const businessKeywords = ['sales', 'management', 'leadership', 'communication', 'negotiation', 'strategy', 'business', 'analytics', 'visualization', 'crm', 'rfp', 'project'];
        return skills.filter(skill =>
            businessKeywords.some(k => skill.toLowerCase().includes(k))
        );
    }, [skills]);

    const technicalSkills = useMemo(() => {
        const techKeywords = ['python', 'javascript', 'react', 'sql', 'tensorflow', 'pytorch', 'aws', 'docker', 'git', 'numpy', 'pandas', 'matplotlib', 'tableau', 'excel', 'r', 'matlab', 'spark', 'hadoop', 'llm', 'nlp', 'api', 'mongodb', 'postgresql', 'nosql'];
        return skills.filter(skill =>
            techKeywords.some(k => skill.toLowerCase().includes(k))
        );
    }, [skills]);

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
                {/* Header - Full Width */}
                <div className="px-5 pt-5 pb-3">
                    {/* Name */}
                    <h1
                        className="text-2xl font-bold tracking-wide"
                        style={{ color: accentColor }}
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
                        <p className="text-sm text-gray-600 mt-0.5">
                            <EditableText
                                value={generatedHeadline}
                                onChange={(v) => onUpdate?.({ targetJob: v })}
                                placeholder="Your Title"
                                displayComponent={<Typewriter text={generatedHeadline} />}
                            />
                        </p>
                    )}

                    {/* Divider */}
                    <div className="h-[3px] mt-2" style={{ backgroundColor: accentColor }} />

                    {/* Contact Info Row */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-gray-600">
                        {personalInfo.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" style={{ color: accentColor }} />
                                <EditableText
                                    value={personalInfo.phone}
                                    onChange={(v) => updatePersonalInfo("phone", v)}
                                    placeholder="+1 234 567 890"
                                    displayComponent={<Typewriter text={personalInfo.phone} />}
                                />
                            </span>
                        )}
                        {personalInfo.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" style={{ color: accentColor }} />
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
                            <span className="flex items-center gap-1">
                                <Linkedin className="w-3 h-3" style={{ color: accentColor }} />
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
                        {personalInfo.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" style={{ color: accentColor }} />
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
                <div className="flex px-5 pb-5 gap-4">
                    {/* Left Column - 60% */}
                    <div className="w-[60%] pr-3 border-r border-gray-200">
                        {/* Summary */}
                        {summary && (
                            <div className="mb-4">
                                <SectionHeader title="Summary" />
                                <p className="text-[10px] text-gray-700 leading-relaxed">
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
                            <div className="mb-4">
                                <SectionHeader title="Experience" />
                                {experience.map((exp, index) => (
                                    <div key={exp.id} className="mb-3">
                                        {/* Company & Title Row */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[11px] font-bold text-gray-900">
                                                    <EditableText
                                                        value={exp.title}
                                                        onChange={(v) => updateExperience(index, { title: v })}
                                                        placeholder="Job Title"
                                                        displayComponent={<Typewriter text={exp.title} />}
                                                    />
                                                </span>
                                                <span className="text-[11px] text-gray-500 mx-1">|</span>
                                                {exp.companyUrl ? (
                                                    <a
                                                        href={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] font-semibold hover:underline"
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
                                                    <span className="text-[11px] font-semibold" style={{ color: accentColor }}>
                                                        <EditableText
                                                            value={exp.company}
                                                            onChange={(v) => updateExperience(index, { company: v })}
                                                            placeholder="Company"
                                                            displayComponent={<Typewriter text={exp.company} />}
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-gray-500 shrink-0 ml-2">
                                                {exp.location && <>{exp.location} | </>}
                                                <Typewriter text={formatDateRange(exp.startDate, exp.endDate, exp.current)} />
                                            </span>
                                        </div>

                                        {/* Bullet Points */}
                                        {exp.bullets.length > 0 && (
                                            <ul className="mt-1 ml-2 space-y-0.5">
                                                {exp.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                                                    <li key={bulletIndex} className="flex items-start text-[9px] text-gray-700">
                                                        <CheckCircle2
                                                            className="w-2.5 h-2.5 mr-1.5 mt-0.5 shrink-0"
                                                            style={{ color: accentColor }}
                                                        />
                                                        <span className="leading-relaxed">
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

                        {/* Education */}
                        {education.length > 0 && (
                            <div className="mb-4">
                                <SectionHeader title="Education" />
                                {education.map((edu, index) => (
                                    <div key={edu.id} className="mb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-900">
                                                    <EditableText
                                                        value={edu.institution}
                                                        onChange={(v) => updateEducation(index, { institution: v })}
                                                        placeholder="Institution"
                                                        displayComponent={<Typewriter text={edu.institution} />}
                                                    />
                                                </div>
                                                <div className="text-[9px] text-gray-600 italic">
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
                                            <span className="text-[9px] text-gray-500 shrink-0 ml-2">
                                                <Typewriter text={formatDateRange(edu.startDate, edu.endDate)} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {certifications.length > 0 && (
                            <div className="mb-4">
                                <SectionHeader title="Certification" />
                                {certifications.map((cert) => (
                                    <div key={cert.id} className="text-[9px] text-gray-700 mb-1">
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
                                <div className="flex flex-wrap gap-2">
                                    {languages.map((lang, index) => (
                                        <div key={index} className="text-[9px]">
                                            <span className="font-semibold text-gray-800">{lang.language}</span>
                                            <span className="text-gray-500 ml-1">{lang.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - 40% */}
                    <div className="w-[40%]">
                        {/* General Skills */}
                        {generalSkills.length > 0 && (
                            <div className="mb-4">
                                <SectionHeader title="General Skills" />
                                <div className="flex flex-wrap">
                                    {generalSkills.map((skill, index) => (
                                        <SkillTag key={index} skill={skill} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Technical Skills */}
                        {technicalSkills.length > 0 && (
                            <div className="mb-4">
                                <SectionHeader title="Technical Skills" />
                                <div className="flex flex-wrap">
                                    {technicalSkills.map((skill, index) => (
                                        <SkillTag key={index} skill={skill} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show all skills if no categorization */}
                        {generalSkills.length === 0 && technicalSkills.length === 0 && skills.length > 0 && (
                            <div className="mb-4">
                                <SectionHeader title="Skills" />
                                <div className="flex flex-wrap">
                                    {skills.map((skill, index) => (
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
                                    <div key={project.id} className="mb-3">
                                        {/* Project Name & Date */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {project.url ? (
                                                    <a
                                                        href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-bold hover:underline"
                                                        style={{ color: accentColor }}
                                                    >
                                                        <Typewriter text={project.name} />
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] font-bold" style={{ color: accentColor }}>
                                                        <Typewriter text={project.name} />
                                                    </span>
                                                )}
                                                {project.technologies.length > 0 && (
                                                    <span className="text-[8px] text-gray-500 ml-1">
                                                        ({project.technologies.slice(0, 3).join(", ")})
                                                    </span>
                                                )}
                                            </div>
                                            {(project.startDate || project.endDate) && (
                                                <span className="text-[8px] text-gray-400 shrink-0 ml-1">
                                                    <Typewriter text={formatDateRange(project.startDate, project.endDate)} />
                                                </span>
                                            )}
                                        </div>

                                        {/* Project URL */}
                                        {project.url && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Link2 className="w-2 h-2" style={{ color: accentColor }} />
                                                <a
                                                    href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[8px] hover:underline truncate"
                                                    style={{ color: accentColor }}
                                                >
                                                    {project.url.replace(/^https?:\/\/(www\.)?/, '')}
                                                </a>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <p className="text-[9px] text-gray-700 mt-1 leading-relaxed">
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
                    </div>
                </div>
            </SequentialAnimationProvider>
        </div>
    );
}
