"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface WelcomePreloaderProps {
    userName: string;
    onComplete?: () => void;
    duration?: number; // Duration in ms before completing
}

export function WelcomePreloader({ userName, onComplete, duration = 2500 }: WelcomePreloaderProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [showText, setShowText] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Parse first name only
    const firstName = userName?.split(" ")[0] || "there";
    const welcomeText = "Welcome,";

    useEffect(() => {
        // Show text after a brief delay
        const showTimer = setTimeout(() => {
            setShowText(true);
        }, 100);

        // Start exit animation after duration
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, duration);

        // Complete and redirect
        const completeTimer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, duration + 1000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [duration, onComplete]);

    // Character animation variants - similar to Framer Reveal Preloader
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.035,
                delayChildren: 0.1,
            },
        },
        exit: {
            y: -100,
            opacity: 0,
            filter: "blur(10px)",
            transition: {
                duration: 0.6,
                ease: [0.96, -0.02, 0.38, 1.01] as const,
            },
        },
    };

    const charVariants = {
        hidden: {
            y: 80,
            opacity: 0,
            filter: "blur(8px)",
        },
        visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring" as const,
                damping: 20,
                stiffness: 100,
                duration: 0.9,
            },
        },
    };

    const bgVariants = {
        visible: {
            filter: "blur(0px)",
            y: 0,
        },
        exit: {
            filter: "blur(12px)",
            y: -100,
            transition: {
                duration: 0.8,
                ease: [0.96, -0.02, 0.38, 1.01] as const,
            },
        },
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/* Background */}
            <motion.div
                className="absolute inset-0 bg-white"
                initial="visible"
                animate={isExiting ? "exit" : "visible"}
                variants={bgVariants}
            />

            {/* Content */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.3 } }}
                    >
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            variants={containerVariants}
                            initial="hidden"
                            animate={showText ? (isExiting ? "exit" : "visible") : "hidden"}
                        >
                            {/* Welcome text */}
                            <div className="flex overflow-hidden">
                                {welcomeText.split("").map((char, index) => (
                                    <motion.span
                                        key={`welcome-${index}`}
                                        variants={charVariants}
                                        className="text-4xl md:text-5xl lg:text-6xl text-slate-900"
                                        style={{
                                            fontFamily: "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
                                            fontStyle: "italic",
                                            display: char === " " ? "inline" : "inline-block",
                                        }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                            </div>

                            {/* User name */}
                            <div className="flex overflow-hidden">
                                {firstName.split("").map((char, index) => (
                                    <motion.span
                                        key={`name-${index}`}
                                        variants={charVariants}
                                        className="text-5xl md:text-6xl lg:text-7xl text-blue-600"
                                        style={{
                                            fontFamily: "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
                                            fontStyle: "italic",
                                            display: char === " " ? "inline" : "inline-block",
                                        }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
