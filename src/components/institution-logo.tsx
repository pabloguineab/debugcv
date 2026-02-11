"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

interface InstitutionLogoProps {
    name: string;
    website?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

/**
 * Displays a university/institution logo based on their website domain.
 * Falls back to a GraduationCap icon if no logo is found.
 */
export function InstitutionLogo({ name, website, size = "lg", className = "" }: InstitutionLogoProps) {
    const [logoSrc, setLogoSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [triedFallback, setTriedFallback] = useState(false);

    // Helper to extract domain from URL
    const getDomain = () => {
        if (website) {
            try {
                const url = new URL(website.startsWith('http') ? website : `https://${website}`);
                return url.hostname.replace(/^www\./, '');
            } catch (e) {
                // invalid url, fall through
            }
        }

        // Manual overrides for common universities without standard domains
        const lowerName = name.toLowerCase().trim();
        const overrides: Record<string, string> = {
            'harvard': 'harvard.edu',
            'harvard university': 'harvard.edu',
            'mit': 'mit.edu',
            'massachusetts institute of technology': 'mit.edu',
            'stanford': 'stanford.edu',
            'stanford university': 'stanford.edu',
            'berkeley': 'berkeley.edu',
            'uc berkeley': 'berkeley.edu',
            'yale': 'yale.edu',
            'yale university': 'yale.edu',
            'princeton': 'princeton.edu',
            'princeton university': 'princeton.edu',
            'columbia': 'columbia.edu',
            'columbia university': 'columbia.edu',
            'oxford': 'ox.ac.uk',
            'university of oxford': 'ox.ac.uk',
            'cambridge': 'cam.ac.uk',
            'university of cambridge': 'cam.ac.uk',
            'caltech': 'caltech.edu',
        };

        if (overrides[lowerName]) return overrides[lowerName];

        // Try to guess domain from name
        const cleanName = lowerName
            .replace(/university of /g, '')
            .replace(/ university/g, '')
            .replace(/universidad de /g, '')
            .replace(/ de /g, '')
            .replace(/\s+/g, '')
            .trim();

        return cleanName.includes('.') ? cleanName : `${cleanName}.edu`;
    };

    const domain = getDomain();

    useEffect(() => {
        if (!domain) {
            setHasError(true);
            return;
        }
        // Try Brandfetch first for high quality logos
        setLogoSrc(`https://cdn.brandfetch.io/${domain}/w/400/h/400`);
        setTriedFallback(false);
        setHasError(false);
    }, [name, website, domain]);

    const handleImageError = () => {
        if (!triedFallback && domain) {
            // Try Logo.dev as fallback
            const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || '';
            setLogoSrc(`https://img.logo.dev/${domain}?token=${token}&size=128&format=png`);
            setTriedFallback(true);
        } else {
            setHasError(true);
        }
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;

        // Check dimensions
        if (img.naturalWidth < 10 || img.naturalHeight < 10) {
            handleImageError();
            return;
        }

        // Try to detect if image is transparent/empty
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = 20;
                canvas.height = 20;
                ctx.drawImage(img, 0, 0, 20, 20);
                const imageData = ctx.getImageData(0, 0, 20, 20);
                const data = imageData.data;

                let hasVisiblePixels = false;
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] > 50) {
                        hasVisiblePixels = true;
                        break;
                    }
                }

                if (!hasVisiblePixels) {
                    handleImageError();
                    return;
                }
            }
        } catch (err) {
            // CORS error - assume valid
        }
    };

    const sizeClasses = {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
        xl: "size-16"
    };

    const iconSizes = {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
        xl: "size-8"
    };

    // Fallback: show GraduationCap icon
    if (hasError || !logoSrc) {
        return (
            <div className={cn(
                sizeClasses[size],
                "rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0",
                className
            )}>
                <GraduationCap className={cn(iconSizes[size], "text-muted-foreground")} />
            </div>
        );
    }

    return (
        <div className={cn(
            sizeClasses[size],
            "rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex items-center justify-center p-1.5 shrink-0",
            className
        )}>
            <img
                crossOrigin="anonymous"
                src={logoSrc}
                alt={name}
                className="w-full h-full object-contain rounded"
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>
    );
}
