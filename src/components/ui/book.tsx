"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface BookProps {
    title?: string;
    author?: string;
    image?: string;
    width?: number;
    height?: number;
}

export function Book({
    title = "Steve Jobs",
    author = "Walter Isaacson",
    image = "https://framerusercontent.com/images/JXL9OqyS9HXAxdkH6ZGIV5PQXQQ.jpg",
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
                {/* Paper/Back */}
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-hidden p-8"
                    style={{
                        background: "linear-gradient(239deg, rgb(255, 255, 255) 0%, rgb(224, 224, 224) 100%)",
                        zIndex: 0,
                    }}
                >
                    <p
                        className="w-full text-center font-bold text-xl"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                        {title}
                    </p>
                    <p
                        className="w-full text-center text-xs opacity-30"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                        {author}
                    </p>
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
                    {/* Cover Image */}
                    <div
                        className="relative overflow-visible"
                        style={{
                            width: "100%",
                            height: "100%",
                            aspectRatio: "0.656 / 1",
                        }}
                    >
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Spine Light Effect */}
                    <div
                        className="absolute top-0 bottom-0 left-0 w-[18px] overflow-hidden"
                        style={{
                            background: "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 23.82%, rgb(0, 0, 0) 40.39%, rgb(255, 255, 255) 48.43%, rgba(255, 255, 255, 0) 100%)",
                            opacity: 0.2,
                            zIndex: 1,
                        }}
                    />

                    {/* Glossy Overlay */}
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                            background: "linear-gradient(38deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)",
                            zIndex: 1,
                        }}
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
