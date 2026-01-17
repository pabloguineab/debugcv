"use client";

import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
}

export function ResumePreview({ data, onFieldClick }: ResumePreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ width: "100%", maxWidth: "800px" }}>
            {/* Resume Paper */}
            <div className="p-8 md:p-12 text-gray-900 text-sm leading-relaxed" style={{ fontFamily: "Times New Roman, serif" }}>
                {/* Header */}
                <div className="text-center border-b border-gray-300 pb-4 mb-6">
                    <h1 
                        className="text-2xl font-bold cursor-pointer hover:bg-primary/10 rounded px-1 transition-colors"
                        onClick={() => onFieldClick?.("fullName")}
                    >
                        {personalInfo.fullName || "Your Name"}
                    </h1>
                    <div className="text-xs text-gray-600 mt-2 flex items-center justify-center gap-2 flex-wrap">
                        <span 
                            className="cursor-pointer hover:bg-primary/10 rounded px-1 transition-colors"
                            onClick={() => onFieldClick?.("location")}
                        >
                            {personalInfo.location || "City, State"}
                        </span>
                        <span>•</span>
                        <span 
                            className="cursor-pointer hover:bg-primary/10 rounded px-1 transition-colors text-primary"
                            onClick={() => onFieldClick?.("email")}
                        >
                            {personalInfo.email || "email@example.com"}
                        </span>
                        <span>•</span>
                        <span 
                            className="cursor-pointer hover:bg-primary/10 rounded px-1 transition-colors"
                            onClick={() => onFieldClick?.("phone")}
                        >
                            {personalInfo.phone || "+1 555-123-4567"}
                        </span>
                    </div>
                </div>

                {/* Professional Summary */}
                <section className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                        Professional Summary
                    </h2>
                    <p 
                        className="text-xs leading-relaxed cursor-pointer hover:bg-primary/10 rounded p-1 transition-colors"
                        onClick={() => onFieldClick?.("summary")}
                    >
                        {summary || "Click to add a professional summary highlighting your key qualifications, experience, and career goals."}
                    </p>
                </section>

                {/* Education */}
                {education.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                            Education
                        </h2>
                        <div className="space-y-3">
                            {education.map((edu, index) => (
                                <div 
                                    key={edu.id} 
                                    className="cursor-pointer hover:bg-primary/10 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("education", index)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-xs uppercase">{edu.institution}</div>
                                            <div className="text-xs italic">{edu.degree} in {edu.field}</div>
                                        </div>
                                        <div className="text-right text-xs">
                                            <div>{edu.location}</div>
                                            <div>{edu.startDate} - {edu.endDate}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {experience.map((exp, index) => (
                                <div 
                                    key={exp.id}
                                    className="cursor-pointer hover:bg-primary/10 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("experience", index)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <div className="font-bold text-xs uppercase">{exp.company}</div>
                                            <div className="text-xs italic">{exp.title}</div>
                                        </div>
                                        <div className="text-right text-xs">
                                            <div>{exp.location}</div>
                                            <div>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</div>
                                        </div>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 text-xs space-y-1">
                                        {exp.bullets.map((bullet, bulletIndex) => (
                                            <li key={bulletIndex}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                            Projects
                        </h2>
                        <div className="space-y-3">
                            {projects.map((project, index) => (
                                <div 
                                    key={project.id}
                                    className="cursor-pointer hover:bg-primary/10 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("projects", index)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-xs uppercase">{project.name}</div>
                                        {project.url && (
                                            <span className="text-xs text-primary">{project.url}</span>
                                        )}
                                    </div>
                                    <p className="text-xs mb-1">{project.description}</p>
                                    {project.technologies.length > 0 && (
                                        <p className="text-xs text-gray-600">
                                            <span className="font-semibold">Technologies:</span> {project.technologies.join(", ")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                            Certifications
                        </h2>
                        <div className="space-y-2">
                            {certifications.map((cert, index) => (
                                <div 
                                    key={cert.id}
                                    className="cursor-pointer hover:bg-primary/10 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("certifications", index)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-xs">{cert.name}</div>
                                            <div className="text-xs text-gray-600">{cert.issuer}</div>
                                        </div>
                                        <div className="text-right text-xs">
                                            <div>{cert.issueDate}{cert.expiryDate ? ` - ${cert.expiryDate}` : ""}</div>
                                            {cert.credentialId && (
                                                <div className="text-gray-500">ID: {cert.credentialId}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                            Skills
                        </h2>
                        <p 
                            className="text-xs cursor-pointer hover:bg-primary/10 rounded p-1 transition-colors"
                            onClick={() => onFieldClick?.("skills")}
                        >
                            {skills.join(" • ")}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}

