"use client";

import { Typewriter, SequentialAnimationProvider } from "@/components/ui/sequential-typewriter";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    animate?: boolean;
}

export function ResumePreview({ data, onFieldClick, animate = false }: ResumePreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

    // Himalayas-style resume template
    return (
        <div 
            className="bg-white overflow-hidden rounded-lg mx-auto border border-gray-200"
            style={{ 
                width: "100%",
                aspectRatio: "210 / 297"
            }}
        >
            <SequentialAnimationProvider animate={animate} key={animate ? "animating" : "static"}>
                {/* Resume Paper - Himalayas Style */}
                <div 
                    className="px-10 py-8 text-gray-800 h-full overflow-auto"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                {/* Header */}
                    <div className="text-center mb-6">
                        <h1 
                            className="text-[26px] font-normal tracking-wide cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors inline-block mb-2"
                            onClick={() => onFieldClick?.("fullName")}
                        >
                            <Typewriter text={personalInfo.fullName || "Your Name"} />
                        </h1>
                        
                        <div className="w-full h-px bg-gray-300 mx-auto mb-3" />

                        <p className="text-[11px] text-gray-600 flex justify-center items-center flex-wrap gap-1">
                            <span 
                                className="cursor-pointer hover:underline"
                                onClick={() => onFieldClick?.("location")}
                            >
                                <Typewriter text={personalInfo.location || "City, State"} />
                            </span>
                            {personalInfo.email && <span> • </span>}
                            <span 
                                className="text-blue-600 cursor-pointer hover:underline"
                                onClick={() => onFieldClick?.("email")}
                            >
                                <Typewriter text={personalInfo.email || ""} />
                            </span>
                            {personalInfo.phone && <span> • </span>}
                            <span 
                                className="cursor-pointer hover:underline"
                                onClick={() => onFieldClick?.("phone")}
                            >
                                <Typewriter text={personalInfo.phone || ""} />
                            </span>
                        </p>
                    </div>

                    {/* Professional Summary */}
                    <div className="mb-5">
                        <h2 className="text-[13px] font-bold text-center mb-3">
                            <Typewriter text="Professional summary" speed={5} />
                        </h2>
                        <div 
                            className="text-[11px] leading-relaxed text-gray-700 cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors min-h-[3em]"
                            onClick={() => onFieldClick?.("summary")}
                        >
                            <Typewriter text={summary || (animate ? "" : "Click to add a professional summary highlighting your key qualifications, experience, and career goals.")} speed={3} />
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
                                    <div 
                                        key={edu.id} 
                                        className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                        onClick={() => onFieldClick?.("education", index)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wide">
                                                    <Typewriter text={edu.institution} />
                                                </div>
                                                <div className="text-[11px] text-gray-600">
                                                    <Typewriter text={`${edu.degree} in ${edu.field}`} />
                                                </div>
                                            </div>
                                            <div className="text-right text-[11px] text-gray-600">
                                                <div><Typewriter text={edu.location || ""} /></div>
                                                <div><Typewriter text={`${edu.startDate} - ${edu.endDate}`} /></div>
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
                                    <div 
                                        key={exp.id}
                                        className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                        onClick={() => onFieldClick?.("experience", index)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wide">
                                                    <Typewriter text={exp.company} />
                                                </div>
                                                <div className="text-[11px] text-gray-700">
                                                    <Typewriter text={exp.title} />
                                                </div>
                                            </div>
                                            <div className="text-right text-[11px] text-gray-600">
                                                <div><Typewriter text={exp.location || ""} /></div>
                                                <div><Typewriter text={`${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`} /></div>
                                            </div>
                                        </div>
                                        
                                        {exp.bullets.length > 0 && (
                                            <div className="ml-4 text-[11px] text-gray-700 space-y-1 mt-2">
                                                {exp.bullets.map((bullet, bulletIndex) => (
                                                    <div key={bulletIndex} className="leading-relaxed">
                                                        <Typewriter text={`• ${bullet}`} speed={2} />
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
                                    <div 
                                        key={project.id}
                                        className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                        onClick={() => onFieldClick?.("projects", index)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-[11px] font-bold uppercase tracking-wide">
                                                <Typewriter text={project.name} />
                                            </div>
                                            {project.url && (
                                                <span className="text-[10px] text-blue-600">
                                                    <Typewriter text={project.url} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-gray-700 leading-relaxed">
                                            <Typewriter text={project.description} speed={2} />
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
                                    <div 
                                        key={cert.id}
                                        className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                        onClick={() => onFieldClick?.("certifications", index)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[11px] font-bold">
                                                    <Typewriter text={cert.name} />
                                                </div>
                                                <div className="text-[10px] text-gray-600">
                                                    <Typewriter text={cert.issuer} />
                                                </div>
                                            </div>
                                            <div className="text-right text-[10px] text-gray-600">
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
