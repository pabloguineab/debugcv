"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

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
                    {/* Custom Cover Design */}
                    <div
                        className="relative w-full h-full overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)",
                        }}
                    >
                        {/* Decorative circles */}
                        <div
                            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
                            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
                        />
                        <div
                            className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-10"
                            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
                        />

                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-5 text-white">
                            {/* Top - Icon & Label */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-medium uppercase tracking-widest opacity-80">
                                    {subtitle}
                                </span>
                            </div>

                            {/* Middle - Job Title */}
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold leading-tight tracking-tight">
                                    {title}
                                </h3>
                            </div>

                            {/* Bottom - Target Company */}
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest opacity-60">
                                    Tailored for
                                </p>
                                <p className="text-sm font-semibold opacity-90">
                                    {target}
                                </p>
                            </div>
                        </div>
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
