"use client";

import { motion } from "framer-motion";
import { ResumeData } from "@/types/resume";

interface BookProps {
    title?: string;
    subtitle?: string;
    target?: string;
    width?: number;
    height?: number;
    variant?: "resume" | "cover-letter";
    previewData?: ResumeData;
    lastUpdated?: string;
}

import { useState } from "react";

export function Book({
    title = "Software Engineer",
    subtitle = "Resume",
    target = "Google",
    width = 200,
    height = 305,
    variant = "resume",
    previewData,
    lastUpdated
}: BookProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isResume = variant === "resume";

    // Tailwind classes need to be full strings
    const accentClasses = {
        bar: isResume ? "bg-blue-500" : "bg-indigo-500",
        gradientLine: isResume ? "from-blue-400" : "from-indigo-400",
        bottomLine: isResume ? "from-blue-500 via-blue-400 to-blue-300" : "from-indigo-500 via-indigo-400 to-indigo-300",
        bgAccent1: isResume ? "rgba(59, 130, 246, 0.08)" : "rgba(99, 102, 241, 0.08)",
        bgAccent2: isResume ? "rgba(59, 130, 246, 0.05)" : "rgba(99, 102, 241, 0.05)",
    };

    return (
        <div
            className="relative cursor-pointer"
            style={{
                width,
                height,
                perspective: 1200,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="w-full h-full"
                initial={{
                    boxShadow: "0px 0.7px 0.7px -0.625px rgba(0,0,0,0), 0px 1.8px 1.8px -1.25px rgba(0,0,0,0), 0px 3.6px 3.6px -1.875px rgba(0,0,0,0), 0px 6.9px 6.9px -2.5px rgba(0,0,0,0), 0px 13.6px 13.6px -3.125px rgba(0,0,0,0), 0px 30px 30px -3.75px rgba(0,0,0,0)"
                }}
                animate={{
                    boxShadow: isHovered
                        ? "0px 0.7px 0.7px -0.625px rgba(0,0,0,0.44), 0px 1.8px 1.8px -1.25px rgba(0,0,0,0.43), 0px 3.6px 3.6px -1.875px rgba(0,0,0,0.41), 0px 6.9px 6.9px -2.5px rgba(0,0,0,0.38), 0px 13.6px 13.6px -3.125px rgba(0,0,0,0.31), 0px 30px 30px -3.75px rgba(0,0,0,0.15)"
                        : "0px 0.7px 0.7px -0.625px rgba(0,0,0,0), 0px 1.8px 1.8px -1.25px rgba(0,0,0,0), 0px 3.6px 3.6px -1.875px rgba(0,0,0,0), 0px 6.9px 6.9px -2.5px rgba(0,0,0,0), 0px 13.6px 13.6px -3.125px rgba(0,0,0,0), 0px 30px 30px -3.75px rgba(0,0,0,0)"
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            >
                {/* Book Container */}
                <motion.div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                        transformStyle: "preserve-3d",
                    }}
                    initial={{ z: 0 }}
                    animate={{
                        originX: 1,
                        z: isHovered ? 50 : 0,
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                >
                    {/* Paper/Back - Preview */}
                    <motion.div
                        className="absolute inset-0 overflow-hidden bg-white rounded-r-md rounded-l-[2px]"
                        style={{
                            background: "white",
                            zIndex: 0,
                        }}
                    >
                        {/* Mini Preview Content with Scale */}
                        {previewData ? (
                            <div
                                className="origin-top-left bg-white text-black overflow-hidden"
                                style={{
                                    width: "600px", // Virtual A4 width
                                    height: "850px", // Virtual A4 height
                                    padding: "30px 40px", // Reduced top padding
                                    transform: `scale(${width ? width / 600 : 0.3})`,
                                    transformOrigin: "top left",
                                    fontFamily: "Georgia, serif"
                                }}
                            >
                                {/* Header */}
                                <div className="text-center mb-5">
                                    <h1 className="text-3xl font-normal text-gray-900 mb-2">{previewData.personalInfo.fullName}</h1>
                                    <div className="text-[11px] text-gray-600 flex justify-center gap-3 mb-4">
                                        {previewData.personalInfo.location && <span>{previewData.personalInfo.location}</span>}
                                        {previewData.personalInfo.email && (
                                            <>
                                                <span>•</span>
                                                <span>{previewData.personalInfo.email}</span>
                                            </>
                                        )}
                                        {previewData.personalInfo.phone && (
                                            <>
                                                <span>•</span>
                                                <span>{previewData.personalInfo.phone}</span>
                                            </>
                                        )}
                                    </div>

                                    {previewData.summary && (
                                        <div className="mb-4">
                                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">Professional Summary</h2>
                                            <div className="text-justify text-[11px] leading-relaxed text-gray-800">
                                                {previewData.summary}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Sections */}
                                <div className="flex flex-col gap-5">

                                    {/* Education */}
                                    {previewData.education?.length > 0 && (
                                        <div>
                                            <h3 className="text-center text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Education</h3>
                                            <div className="flex flex-col gap-3">
                                                {previewData.education.map((edu, i) => (
                                                    <div key={i} className="flex justify-between items-start text-[11px]">
                                                        <div className="max-w-[80%]">
                                                            <div className="font-bold text-gray-900 uppercase">{edu.institution}</div>
                                                            <div className="text-gray-700 italic">{edu.degree}</div>
                                                        </div>
                                                        <div className="text-gray-600 font-medium whitespace-nowrap">{edu.endDate}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {previewData.experience?.length > 0 && (
                                        <div>
                                            <h3 className="text-center text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 pt-2">Experience</h3>
                                            <div className="flex flex-col gap-4">
                                                {previewData.experience.slice(0, 3).map((exp, i) => (
                                                    <div key={i} className="text-[11px]">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <div className="font-bold text-gray-900 uppercase">{exp.company}</div>
                                                            <div className="text-gray-600 text-[10px]">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
                                                        </div>
                                                        <div className="italic text-gray-800 mb-1">{exp.title}</div>
                                                        {exp.bullets?.map((bullet, idx) => (
                                                            <div key={idx} className="flex gap-2 mb-0.5 pl-1">
                                                                <span className="text-gray-500">•</span>
                                                                <span className="text-gray-700 text-justify leading-tight flex-1">{bullet}</span>
                                                            </div>
                                                        )).slice(0, 2)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects */}
                                    {previewData.projects?.length > 0 && (
                                        <div>
                                            <h3 className="text-center text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 pt-2">Projects</h3>
                                            <div className="flex flex-col gap-3">
                                                {previewData.projects.slice(0, 2).map((proj, i) => (
                                                    <div key={i} className="text-[11px]">
                                                        <div className="font-bold text-gray-900">{proj.name}</div>
                                                        <div className="text-gray-700 text-justify leading-tight">{proj.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Certifications */}
                                    {previewData.certifications?.length > 0 && (
                                        <div>
                                            <h3 className="text-center text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 pt-1">Certifications</h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[10px]">
                                                {previewData.certifications.slice(0, 4).map((cert, i) => (
                                                    <div key={i} className="flex gap-1 items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                        <span className="font-semibold text-gray-800">{cert.name}</span>
                                                        <span className="text-gray-500 text-[9px]">({cert.issueDate})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {previewData.skills?.length > 0 && (
                                        <div className="mt-2">
                                            <h3 className="text-center text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 pt-1">Skills</h3>
                                            <div className="text-center text-[10px] text-gray-700 leading-relaxed px-4">
                                                {previewData.skills.slice(0, 30).join(" • ")}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Fade out overlay with ellipsis */}
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col justify-end items-center pb-8">
                                    <span className="text-3xl text-gray-400 tracking-widest leading-none">...</span>
                                </div>
                            </div>
                        ) : (
                            // Skeleton for empty state
                            <div className="w-full h-full p-4 space-y-4 opacity-50">
                                <div className="h-4 w-1/2 bg-gray-200 mx-auto rounded" />
                                <div className="space-y-2 pt-4">
                                    <div className="h-2 w-full bg-gray-100 rounded" />
                                    <div className="h-2 w-full bg-gray-100 rounded" />
                                    <div className="h-2 w-3/4 bg-gray-100 rounded" />
                                </div>
                                <div className="pt-4 space-y-3">
                                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                                    <div className="h-2 w-full bg-gray-100 rounded" />
                                    <div className="h-2 w-full bg-gray-100 rounded" />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Cover */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-r-md rounded-l-[2px]"
                        style={{
                            zIndex: 1,
                            transformStyle: "preserve-3d",
                        }}
                        initial={{ rotateY: 0, z: 0, originX: 0 }}
                        animate={{
                            rotateY: isHovered ? -75 : 0, // Restored original angle to prevent backface issues
                            z: isHovered ? 10 : 0,
                            originX: 0,
                        }}
                        transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                    >
                        {/* Custom Cover Design */}
                        <div
                            className="relative w-full h-full overflow-hidden rounded-r-md rounded-l-[2px]"
                            style={{
                                background: "linear-gradient(180deg, #fafafa 0%, #f5f5f4 100%)",
                            }}
                        >
                            {/* Geometric accents */}
                            <div
                                className="absolute top-0 right-0 w-24 h-24"
                                style={{
                                    background: `linear-gradient(135deg, transparent 50%, ${accentClasses.bgAccent1} 50%)`
                                }}
                            />
                            <div
                                className="absolute bottom-0 left-0 w-16 h-16"
                                style={{
                                    background: `linear-gradient(315deg, transparent 50%, ${accentClasses.bgAccent2} 50%)`
                                }}
                            />

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-between p-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1 h-4 ${accentClasses.bar} rounded-full`} />
                                        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-gray-400">
                                            {subtitle}
                                        </span>
                                    </div>
                                    {lastUpdated && (
                                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-gray-400 mt-2 ml-3">
                                            {lastUpdated}
                                        </p>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-center py-4">
                                    <h3
                                        className="text-xl font-semibold leading-snug text-gray-900 tracking-tight"
                                        style={{ fontFamily: '"Georgia", serif' }}
                                    >
                                        {title}
                                    </h3>
                                    <div className={`mt-3 h-px w-12 bg-gradient-to-r ${accentClasses.gradientLine} to-transparent`} />
                                </div>

                                <div className="space-y-0.5 relative">
                                    <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400">
                                        Tailored for
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {target}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom line */}
                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${accentClasses.bottomLine}`} />
                        </div>

                        {/* Spine Light Effect */}
                        <div
                            className="absolute top-0 bottom-0 left-0 w-[18px] overflow-hidden pointer-events-none"
                            style={{
                                background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.4) 20%, rgba(0,0,0,0.2) 40%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                                zIndex: 2,
                            }}
                        />

                        {/* Glossy Overlay */}
                        <div
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{
                                background: "linear-gradient(38deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%)",
                                zIndex: 2,
                            }}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
