import React from "react";

type LogoProps = {
    className?: string;
    variant?: "default" | "white";
};

export const Logo = ({ className = "", variant = "default" }: LogoProps) => {
    const isWhite = variant === "white";

    return (
        <svg
            viewBox="0 0 190 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="DebugCV Logo"
        >
            {/* Icon Group */}
            <g transform="translate(2, 2) scale(0.9)">
                {/* Shield Outline with Bracket shape */}
                <path
                    d="M18 2L4 6V13L9 17L4 21V26L18 34L32 26V21L27 17L32 13V6L18 2Z"
                    className={isWhite ? "stroke-white" : "stroke-[#0F172A]"} // Slate-900 for dark parts
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Brackets Accent (Optional, emphasizing the tech aspect) */}
                <path
                    d="M4 13L9 17L4 21 M32 13L27 17L32 21"
                    className={isWhite ? "stroke-blue-400" : "stroke-[#0F172A]"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Magnifying Glass */}
                <circle
                    cx="18"
                    cy="17"
                    r="7"
                    className={isWhite ? "stroke-blue-400" : "stroke-[#0EA5E9]"} // Sky-500 for light blue
                    strokeWidth="2.5"
                    fill="none"
                />
                <path
                    d="M24 23L29 28"
                    className={isWhite ? "stroke-blue-400" : "stroke-[#0EA5E9]"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                {/* Reflection on glass */}
                <path
                    d="M15 14C15 13 16 12 17 12"
                    className={isWhite ? "stroke-blue-200/50" : "stroke-[#0EA5E9]/50"}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </g>

            {/* Text: DebugCV */}
            <text
                x="48"
                y="29"
                fontFamily="'Poppins', system-ui, -apple-system, sans-serif"
                fontWeight="800"
                fontSize="28"
                className={isWhite ? "fill-white" : "fill-[#0F172A]"}
                style={{ letterSpacing: '-0.02em' }}
            >
                Debug<tspan className={isWhite ? "fill-blue-400" : "fill-[#0EA5E9]"}>CV</tspan>
            </text>
        </svg>
    );
};
