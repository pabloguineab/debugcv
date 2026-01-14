"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, ComponentType } from "react";

// Type for the Framer component props
interface FramerRevealPreloaderProps {
    variant?: "Start" | "Finish" | "YIt9qwMGK" | "etT6f4Ljm";
    style?: React.CSSProperties;
}

// Dynamic import of Framer component with proper typing
const RevealPreloader = dynamic<FramerRevealPreloaderProps>(
    () => import("https://framer.com/m/Reveal-Preloader-0HTX.js@36SdoN1ndEg803lapJS1").then(
        (mod) => mod.default as ComponentType<FramerRevealPreloaderProps>
    ),
    { ssr: false, loading: () => <div className="w-full h-full bg-white" /> }
);

interface WelcomePreloaderProps {
    userName: string;
    onComplete?: () => void;
    duration?: number; // Duration in ms before redirecting
}

export function WelcomePreloader({ userName, onComplete, duration = 2500 }: WelcomePreloaderProps) {
    const [variant, setVariant] = useState<"Start" | "Finish">("Start");
    const [isVisible, setIsVisible] = useState(true);

    // Parse first name only
    const firstName = userName?.split(" ")[0] || "there";

    useEffect(() => {
        // After duration, trigger the Finish animation
        const timer = setTimeout(() => {
            setVariant("Finish");
            // Then hide and call onComplete
            setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 1000); // Wait for animation to complete
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
            {/* Framer Reveal Preloader - Full screen */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ width: "100vw", height: "100vh" }}>
                <RevealPreloader variant={variant} style={{ width: "100%", height: "100%" }} />
            </div>

            {/* Custom text overlay with user name */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="text-center">
                    <p
                        className="text-4xl md:text-5xl lg:text-6xl italic text-black"
                        style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                    >
                        Welcome, {firstName}
                    </p>
                </div>
            </div>
        </div>
    );
}
