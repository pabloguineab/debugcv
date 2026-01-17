"use client";

import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
}

export function ResumePreview({ data, onFieldClick }: ResumePreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

    // Himalayas-style resume template
    return (
        <div 
            className="bg-white overflow-hidden rounded-lg mx-auto"
            style={{ 
                width: "100%",
                aspectRatio: "210 / 297"
            }}
        >
            {/* Resume Paper - Himalayas Style */}
            <div 
                className="px-10 py-8 text-gray-800 h-full overflow-auto"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
                {/* Header with line above name */}
                <div className="text-center mb-6">
                    <div className="w-48 h-px bg-gray-400 mx-auto mb-4" />
                    <h1 
                        className="text-[22px] font-normal tracking-wide cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors inline-block"
                        onClick={() => onFieldClick?.("fullName")}
                    >
                        {personalInfo.fullName || "Your Name"}
                    </h1>
                    <p className="text-[11px] text-gray-600 mt-2">
                        <span 
                            className="cursor-pointer hover:underline"
                            onClick={() => onFieldClick?.("location")}
                        >
                            {personalInfo.location || "City, State"}
                        </span>
                        {" • "}
                        <span 
                            className="text-blue-600 cursor-pointer hover:underline"
                            onClick={() => onFieldClick?.("email")}
                        >
                            {personalInfo.email || "email@example.com"}
                        </span>
                        {" • "}
                        <span 
                            className="cursor-pointer hover:underline"
                            onClick={() => onFieldClick?.("phone")}
                        >
                            {personalInfo.phone || "+1 555-123-4567"}
                        </span>
                    </p>
                </div>

                {/* Professional Summary */}
                <section className="mb-5">
                    <h2 className="text-[13px] font-bold text-center mb-3">
                        Professional summary
                    </h2>
                    <p 
                        className="text-[11px] leading-relaxed text-gray-700 cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                        onClick={() => onFieldClick?.("summary")}
                    >
                        {summary || "Click to add a professional summary highlighting your key qualifications, experience, and career goals."}
                    </p>
                </section>

                {/* Education */}
                {education.length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-[13px] font-bold text-center mb-3">
                            Education
                        </h2>
                        <div className="space-y-3">
                            {education.map((edu, index) => (
                                <div 
                                    key={edu.id} 
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("education", index)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-wide">{edu.institution}</div>
                                            <div className="text-[11px] text-gray-600">{edu.degree} in {edu.field}</div>
                                        </div>
                                        <div className="text-right text-[11px] text-gray-600">
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
                    <section className="mb-5">
                        <h2 className="text-[13px] font-bold text-center mb-3">
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {experience.map((exp, index) => (
                                <div 
                                    key={exp.id}
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("experience", index)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-wide">{exp.company}</div>
                                            <div className="text-[11px] text-gray-700">{exp.title}</div>
                                        </div>
                                        <div className="text-right text-[11px] text-gray-600">
                                            <div>{exp.location}</div>
                                            <div>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</div>
                                        </div>
                                    </div>
                                    {exp.bullets.length > 0 && (
                                        <ul className="list-disc list-outside ml-4 text-[11px] text-gray-700 space-y-1 mt-2">
                                            {exp.bullets.map((bullet, bulletIndex) => (
                                                <li key={bulletIndex} className="leading-relaxed">{bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-[13px] font-bold text-center mb-3">
                            Projects
                        </h2>
                        <div className="space-y-3">
                            {projects.map((project, index) => (
                                <div 
                                    key={project.id}
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("projects", index)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-[11px] font-bold uppercase tracking-wide">{project.name}</div>
                                        {project.url && (
                                            <span className="text-[10px] text-blue-600">{project.url}</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-700 leading-relaxed">{project.description}</p>
                                    {project.technologies.length > 0 && (
                                        <p className="text-[10px] text-gray-500 mt-1">
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
                    <section className="mb-5">
                        <h2 className="text-[13px] font-bold text-center mb-3">
                            Certifications
                        </h2>
                        <div className="space-y-2">
                            {certifications.map((cert, index) => (
                                <div 
                                    key={cert.id}
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                    onClick={() => onFieldClick?.("certifications", index)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-[11px] font-bold">{cert.name}</div>
                                            <div className="text-[10px] text-gray-600">{cert.issuer}</div>
                                        </div>
                                        <div className="text-right text-[10px] text-gray-600">
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
                        <h2 className="text-[13px] font-bold text-center mb-3">
                            Skills
                        </h2>
                        <p 
                            className="text-[11px] text-gray-700 cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors text-center"
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
