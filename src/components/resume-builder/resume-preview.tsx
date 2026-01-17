"use client";

import { motion, Variants } from "framer-motion";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
    data: ResumeData;
    onFieldClick?: (field: string, index?: number) => void;
    animate?: boolean;
}

export function ResumePreview({ data, onFieldClick, animate = false }: ResumePreviewProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

    // Animation Variants
    // Container that orchestrates the sequence
    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    // Sections also stagger their internal content (recursive effect)
    const sectionVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    // The reveal effect for text/elements (Left to Right wipe)
    const itemVariants: Variants = {
        hidden: { 
            opacity: 0,
            clipPath: "inset(0 100% 0 0)",
            y: 5 
        },
        visible: { 
            opacity: 1,
            clipPath: "inset(0 0 0 0)",
            y: 0,
            transition: { 
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    // Helper wrapper to apply animation logic cleanly
    const AnimatedSection = ({ children, className }: { children: React.ReactNode, className?: string }) => (
        <motion.div 
            variants={sectionVariants} 
            className={className}
        >
            {children}
        </motion.div>
    );

    const AnimatedItem = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
        <motion.div 
            variants={itemVariants} 
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );

    // Using displayed data (direct data since animation handles the transition from empty to full visually)
    const displayValues = {
        summary: summary,
        skills: skills.join(" • "),
        experience: experience,
        education: education,
        projects: projects,
        certifications: certifications
    };

    // Himalayas-style resume template
    return (
        <div 
            className="bg-white overflow-hidden rounded-lg mx-auto border border-gray-200"
            style={{ 
                width: "100%",
                aspectRatio: "210 / 297"
            }}
        >
            {/* Resume Paper - Himalayas Style */}
            <motion.div 
                className="px-10 py-8 text-gray-800 h-full overflow-auto"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                initial={animate ? "hidden" : "visible"}
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <AnimatedSection className="text-center mb-6">
                    <AnimatedItem>
                         <div className="w-48 h-px bg-gray-400 mx-auto mb-4" />
                    </AnimatedItem>
                    <AnimatedItem 
                        className="text-[22px] font-normal tracking-wide cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors inline-block"
                        onClick={() => onFieldClick?.("fullName")}
                    >
                        {personalInfo.fullName || "Your Name"}
                    </AnimatedItem>
                    <AnimatedItem className="text-[11px] text-gray-600 mt-2">
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
                    </AnimatedItem>
                </AnimatedSection>

                {/* Professional Summary */}
                <AnimatedSection className="mb-5">
                    <AnimatedItem className="text-[13px] font-bold text-center mb-3">
                        Professional summary
                    </AnimatedItem>
                    <AnimatedItem 
                        className="text-[11px] leading-relaxed text-gray-700 cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors min-h-[3em]"
                        onClick={() => onFieldClick?.("summary")}
                    >
                        {displayValues.summary || (animate ? "" : "Click to add a professional summary highlighting your key qualifications, experience, and career goals.")}
                    </AnimatedItem>
                </AnimatedSection>

                {/* Education */}
                {displayValues.education.length > 0 && (
                    <AnimatedSection className="mb-5">
                        <AnimatedItem className="text-[13px] font-bold text-center mb-3">
                            Education
                        </AnimatedItem>
                        <div className="space-y-3">
                            {displayValues.education.map((edu, index) => (
                                <AnimatedSection 
                                    key={edu.id} 
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                >
                                    <AnimatedItem className="flex justify-between items-start" onClick={() => onFieldClick?.("education", index)}>
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-wide">{edu.institution}</div>
                                            <div className="text-[11px] text-gray-600">{edu.degree} in {edu.field}</div>
                                        </div>
                                        <div className="text-right text-[11px] text-gray-600">
                                            <div>{edu.location}</div>
                                            <div>{edu.startDate} - {edu.endDate}</div>
                                        </div>
                                    </AnimatedItem>
                                </AnimatedSection>
                            ))}
                        </div>
                    </AnimatedSection>
                )}

                {/* Experience */}
                {displayValues.experience.length > 0 && (
                    <AnimatedSection className="mb-5">
                        <AnimatedItem className="text-[13px] font-bold text-center mb-3">
                            Experience
                        </AnimatedItem>
                        <div className="space-y-4">
                            {displayValues.experience.map((exp, index) => (
                                <AnimatedSection 
                                    key={exp.id}
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                >
                                    <AnimatedItem className="flex justify-between items-start mb-1" onClick={() => onFieldClick?.("experience", index)}>
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-wide">{exp.company}</div>
                                            <div className="text-[11px] text-gray-700">{exp.title}</div>
                                        </div>
                                        <div className="text-right text-[11px] text-gray-600">
                                            <div>{exp.location}</div>
                                            <div>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</div>
                                        </div>
                                    </AnimatedItem>
                                    
                                    {exp.bullets.length > 0 && (
                                        <AnimatedSection className="list-disc list-outside ml-4 text-[11px] text-gray-700 space-y-1 mt-2">
                                            {exp.bullets.map((bullet, bulletIndex) => (
                                                <AnimatedItem key={bulletIndex} className="leading-relaxed">
                                                    <li>{bullet}</li>
                                                </AnimatedItem>
                                            ))}
                                        </AnimatedSection>
                                    )}
                                </AnimatedSection>
                            ))}
                        </div>
                    </AnimatedSection>
                )}

                {/* Projects */}
                {displayValues.projects.length > 0 && (
                    <AnimatedSection className="mb-5">
                        <AnimatedItem className="text-[13px] font-bold text-center mb-3">
                            Projects
                        </AnimatedItem>
                        <div className="space-y-3">
                            {displayValues.projects.map((project, index) => (
                                <AnimatedSection 
                                    key={project.id}
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                >
                                    <AnimatedItem className="flex justify-between items-start mb-1" onClick={() => onFieldClick?.("projects", index)}>
                                        <div className="text-[11px] font-bold uppercase tracking-wide">{project.name}</div>
                                        {project.url && (
                                            <span className="text-[10px] text-blue-600">{project.url}</span>
                                        )}
                                    </AnimatedItem>
                                    <AnimatedItem 
                                        className="text-[11px] text-gray-700 leading-relaxed"
                                        onClick={() => onFieldClick?.("projects", index)}
                                    >
                                        {project.description}
                                    </AnimatedItem>
                                    {project.technologies.length > 0 && (
                                        <AnimatedItem 
                                            className="text-[10px] text-gray-500 mt-1"
                                            onClick={() => onFieldClick?.("projects", index)}
                                        >
                                            <span className="font-semibold">Technologies:</span> {project.technologies.join(", ")}
                                        </AnimatedItem>
                                    )}
                                </AnimatedSection>
                            ))}
                        </div>
                    </AnimatedSection>
                )}

                {/* Certifications */}
                {displayValues.certifications.length > 0 && (
                    <AnimatedSection className="mb-5">
                        <AnimatedItem className="text-[13px] font-bold text-center mb-3">
                            Certifications
                        </AnimatedItem>
                        <div className="space-y-2">
                            {displayValues.certifications.map((cert, index) => (
                                <AnimatedSection 
                                    key={cert.id}
                                    className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
                                >
                                    <AnimatedItem className="flex justify-between items-start" onClick={() => onFieldClick?.("certifications", index)}>
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
                                    </AnimatedItem>
                                </AnimatedSection>
                            ))}
                        </div>
                    </AnimatedSection>
                )}

                {/* Skills */}
                {displayValues.skills.length > 0 && (
                    <AnimatedSection>
                        <AnimatedItem className="text-[13px] font-bold text-center mb-3">
                            Skills
                        </AnimatedItem>
                        <AnimatedItem 
                            className="text-[11px] text-gray-700 cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors text-center"
                            onClick={() => onFieldClick?.("skills")}
                        >
                            {displayValues.skills}
                        </AnimatedItem>
                    </AnimatedSection>
                )}
            </motion.div>
        </div>
    );
}
