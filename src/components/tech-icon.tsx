"use client";

import { useState } from "react";
import Image from "next/image";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechIconProps {
    iconPath: string;
    name: string;
    size?: number;
    priority?: boolean;
    className?: string;
}

export function TechIcon({ iconPath, name, size = 40, priority = false, className }: TechIconProps) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md",
                    className
                )}
                style={{ width: size, height: size }}
            >
                <Code2 className="size-5 text-gray-400" />
            </div>
        );
    }

    return (
        <Image
            src={iconPath}
            alt={name}
            width={size}
            height={size}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={cn("object-contain", className)}
            onError={() => setHasError(true)}
        />
    );
}
