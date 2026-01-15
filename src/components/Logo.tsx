import React from "react";

type LogoProps = {
    className?: string;
    variant?: "default" | "white";
};

export const Logo = ({ className = "", variant = "default" }: LogoProps) => {
    const isWhite = variant === "white";

    return (
        <img
            src="/animated/logo.svg"
            alt="DebugCV Logo"
            className={className}
        />
    );
};
