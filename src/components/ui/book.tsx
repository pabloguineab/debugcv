"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface BookProps {
    title?: string;
    description?: string;
    image?: string;
    width?: number;
    height?: number;
}

export function Book({
    title = "My Resume",
    description = "Pablo Guinea",
    image = "/placeholder-cover.jpg",
    width = 200,
    height = 300
}: BookProps) {
    return (
        <div
            className="relative group cursor-pointer"
            style={{ width, height, perspective: "1200px" }}
        >
            {/* Shadow */}
            <motion.div
                className="absolute inset-0 bg-black/20 rounded-lg blur-xl"
                style={{
                    top: "20px",
                    width: "100%",
                    height: "100%",
                    zIndex: -1
                }}
                initial={{ opacity: 0.2, scale: 0.9 }}
                whileHover={{ opacity: 0.4, scale: 1.05 }}
                transition={{ duration: 0.4 }}
            />

            {/* Book Container with 3D rotation */}
            <motion.div
                className="relative preserve-3d w-full h-full"
                style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "left center"
                }}
                initial={{ rotateY: 0, z: 0 }}
                whileHover={{ rotateY: -35, z: 20, x: 20 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    mass: 0.5
                }}
            >
                {/* Front Cover */}
                <div
                    className="absolute inset-0 bg-white rounded-r-md overflow-hidden shadow-lg border-l border-gray-200"
                    style={{
                        backfaceVisibility: "hidden",
                        zIndex: 2,
                        transform: "translateZ(1px)"
                    }}
                >
                    {/* Spine gradient effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-300 via-gray-100 to-transparent opacity-50 z-20 pointer-events-none" />

                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent z-20 pointer-events-none" />

                    <div className="relative w-full h-full flex flex-col">
                        {/* Cover Image/Content */}
                        <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-6 flex flex-col justify-between text-white relative overflow-hidden">
                            {/* Decorative shapes */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-5 translate-y-5" />

                            <div className="relative z-10 w-full aspect-[3/4] bg-white shadow-lg rounded-sm overflow-hidden mb-4 opacity-90 transform rotate-1">
                                {/* If we had a real preview image of the CV, it would go here. For now a skeleton */}
                                <div className="p-2 space-y-2">
                                    <div className="w-1/3 h-2 bg-gray-200 rounded" />
                                    <div className="w-full h-px bg-gray-100 my-1" />
                                    <div className="space-y-1">
                                        <div className="w-full h-1 bg-gray-100 rounded" />
                                        <div className="w-full h-1 bg-gray-100 rounded" />
                                        <div className="w-2/3 h-1 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-bold text-lg leading-tight mb-1 font-serif">{title}</h3>
                                <p className="text-xs text-blue-100 font-medium uppercase tracking-wider">{description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pages (Thickness) */}
                <div
                    className="absolute right-0 top-1 bottom-1 w-8 bg-white"
                    style={{
                        transform: "rotateY(90deg) translateZ(-4px) translateX(2px)",
                        transformOrigin: "right center",
                        background: "linear-gradient(90deg, #e5e5e5 0%, #fff 50%, #e5e5e5 100%)"
                    }}
                >
                    {/* Lines simulating pages */}
                    <div className="h-full w-full flex flex-col justify-evenly px-0.5">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="h-px w-full bg-gray-200" />
                        ))}
                    </div>
                </div>

                {/* Back Cover (inside) */}
                <div
                    className="absolute inset-x-0 top-1 bottom-1 bg-white rounded-l-sm"
                    style={{
                        transform: "translateZ(-10px)",
                        zIndex: 1,
                        background: "#f8f9fa",
                        boxShadow: "inset -5px 0 10px rgba(0,0,0,0.1)"
                    }}
                />

            </motion.div>
        </div>
    );
}
