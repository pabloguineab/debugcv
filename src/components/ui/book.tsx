"use client";

import { motion } from "framer-motion";

interface BookProps {
    title?: string;
    subtitle?: string;
    target?: string;
    width?: number;
    height?: number;
}

export function Book({
    title = "Software Engineer",
    subtitle = "Resume",
    target = "Google",
    width = 200,
    height = 305
}: BookProps) {
    return (
        <motion.div
            className="relative cursor-pointer"
            style={{
                width,
                height,
                perspective: 1200,
            }}
            initial={{
                boxShadow: "0px 0.7px 0.7px -0.625px rgba(0,0,0,0), 0px 1.8px 1.8px -1.25px rgba(0,0,0,0), 0px 3.6px 3.6px -1.875px rgba(0,0,0,0), 0px 6.9px 6.9px -2.5px rgba(0,0,0,0), 0px 13.6px 13.6px -3.125px rgba(0,0,0,0), 0px 30px 30px -3.75px rgba(0,0,0,0)"
            }}
            whileHover={{
                boxShadow: "0px 0.7px 0.7px -0.625px rgba(0,0,0,0.44), 0px 1.8px 1.8px -1.25px rgba(0,0,0,0.43), 0px 3.6px 3.6px -1.875px rgba(0,0,0,0.41), 0px 6.9px 6.9px -2.5px rgba(0,0,0,0.38), 0px 13.6px 13.6px -3.125px rgba(0,0,0,0.31), 0px 30px 30px -3.75px rgba(0,0,0,0.15)"
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
                whileHover={{
                    originX: 1,
                    z: 50,
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            >
                {/* Paper/Back - Resume Preview */}
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-hidden p-6"
                    style={{
                        background: "linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(248, 250, 252) 100%)",
                        zIndex: 0,
                    }}
                >
                    {/* Mini Resume Preview */}
                    <div className="w-full space-y-3">
                        <div className="h-2 w-1/3 bg-gray-200 rounded" />
                        <div className="h-px w-full bg-gray-100" />
                        <div className="space-y-1.5">
                            <div className="h-1.5 w-full bg-gray-100 rounded" />
                            <div className="h-1.5 w-full bg-gray-100 rounded" />
                            <div className="h-1.5 w-2/3 bg-gray-100 rounded" />
                        </div>
                        <div className="h-px w-full bg-gray-100 mt-2" />
                        <div className="space-y-1.5">
                            <div className="h-1.5 w-full bg-gray-100 rounded" />
                            <div className="h-1.5 w-full bg-gray-100 rounded" />
                            <div className="h-1.5 w-4/5 bg-gray-100 rounded" />
                        </div>
                    </div>
                </motion.div>

                {/* Cover */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    style={{
                        zIndex: 1,
                        transformStyle: "preserve-3d",
                    }}
                    initial={{ rotateY: 0, z: 0, originX: 0 }}
                    whileHover={{
                        rotateY: -70,
                        z: 10,
                        originX: 0,
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                >
                    {/* Custom Cover Design - Minimalist & Elegant */}
                    <div
                        className="relative w-full h-full overflow-hidden"
                        style={{
                            background: "linear-gradient(180deg, #fafafa 0%, #f5f5f4 100%)",
                        }}
                    >
                        {/* Subtle geometric accent */}
                        <div
                            className="absolute top-0 right-0 w-24 h-24"
                            style={{
                                background: "linear-gradient(135deg, transparent 50%, rgba(59, 130, 246, 0.08) 50%)"
                            }}
                        />
                        <div
                            className="absolute bottom-0 left-0 w-16 h-16"
                            style={{
                                background: "linear-gradient(315deg, transparent 50%, rgba(59, 130, 246, 0.05) 50%)"
                            }}
                        />

                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-5">
                            {/* Top - Elegant label */}
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-gray-400">
                                    {subtitle}
                                </span>
                            </div>

                            {/* Middle - Job Title with serif font */}
                            <div className="flex-1 flex flex-col justify-center py-4">
                                <h3
                                    className="text-xl font-semibold leading-snug text-gray-900 tracking-tight"
                                    style={{ fontFamily: '"Georgia", serif' }}
                                >
                                    {title}
                                </h3>
                                <div className="mt-3 h-px w-12 bg-gradient-to-r from-blue-400 to-transparent" />
                            </div>

                            {/* Bottom - Target Company */}
                            <div className="space-y-0.5">
                                <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400">
                                    Tailored for
                                </p>
                                <p className="text-sm font-medium text-gray-700">
                                    {target}
                                </p>
                            </div>
                        </div>

                        {/* Thin accent line at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300" />
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
    );
}
