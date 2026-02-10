"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
    company: string;
    logo?: string;
    website?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    onLogoSuccess?: () => void;
    onLogoFallback?: () => void;
}

// Job board domains to filter out from API logos
const JOB_BOARD_DOMAINS = ['linkedin', 'indeed', 'glassdoor', 'ziprecruiter', 'monster.com', 'infojobs'];

function isJobBoardLogo(url: string): boolean {
    const lower = url.toLowerCase();
    return JOB_BOARD_DOMAINS.some(d => lower.includes(d));
}

function getDomain(company: string, website?: string): string {
    const lowerCompany = company.toLowerCase().trim();

    // Manual overrides for major companies
    const overrides: Record<string, string> = {
        'vercel': 'vercel.com', 'stripe': 'stripe.com', 'figma': 'figma.com',
        'linear': 'linear.app', 'notion': 'notion.so', 'google': 'google.com',
        'amazon': 'amazon.com', 'microsoft': 'microsoft.com', 'meta': 'meta.com',
        'facebook': 'meta.com', 'apple': 'apple.com', 'netflix': 'netflix.com',
        'uber': 'uber.com', 'airbnb': 'airbnb.com', 'twitter': 'twitter.com',
        'x': 'twitter.com', 'tesla': 'tesla.com', 'ibm': 'ibm.com',
        'oracle': 'oracle.com', 'salesforce': 'salesforce.com', 'adobe': 'adobe.com',
        'intel': 'intel.com', 'nvidia': 'nvidia.com', 'spotify': 'spotify.com',
        'slack': 'slack.com', 'atlassian': 'atlassian.com', 'dropbox': 'dropbox.com',
        'github': 'github.com', 'gitlab': 'gitlab.com', 'shopify': 'shopify.com',
        'zoom': 'zoom.us', 'paypal': 'paypal.com', 'coinbase': 'coinbase.com',
        'cloudflare': 'cloudflare.com', 'mongodb': 'mongodb.com', 'datadog': 'datadoghq.com',
        'twilio': 'twilio.com', 'hubspot': 'hubspot.com', 'accenture': 'accenture.com',
        'ravenpack': 'ravenpack.com', 'sngular': 'sngular.com', 'solera': 'solera.com',
        'welocalize': 'welocalize.com', 'dlocal': 'dlocal.com',
    };

    if (overrides[lowerCompany]) return overrides[lowerCompany];

    if (website) {
        try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`);
            return url.hostname.replace(/^www\./, '');
        } catch {
            // invalid url, fall through
        }
    }

    // Fallback: clean company name and append .com
    const cleanName = lowerCompany
        .replace(/ inc\.?$/, '').replace(/ corp\.?$/, '').replace(/ corporation$/, '')
        .replace(/ llc$/, '').replace(/ ltd\.?$/, '').replace(/ limited$/, '')
        .replace(/, s\.l\.?$/i, '').replace(/ s\.l\.?$/i, '')
        .replace(/, s\.a\.?$/i, '').replace(/ s\.a\.?$/i, '')
        .trim().replace(/\s+/g, '');

    return cleanName.includes('.') ? cleanName : `${cleanName}.com`;
}

export function CompanyLogo({ company, logo, website, size = "md", className = "", onLogoSuccess, onLogoFallback }: CompanyLogoProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    const domain = getDomain(company, website);

    // Build ordered list of logo URLs to try
    const logoUrls = (() => {
        const urls: string[] = [];

        // 1. API-provided logo (best source, from Google Images) - if not a job board logo
        if (logo && !isJobBoardLogo(logo)) {
            urls.push(logo);
        }

        // 2. Clearbit (high quality logos)
        urls.push(`https://logo.clearbit.com/${domain}`);

        // 3. Unavatar (aggregates Clearbit, Google, DuckDuckGo, etc.)
        urls.push(`https://unavatar.io/${domain}?fallback=false`);

        // 4. Google Favicon (128px - decent quality for most sites)
        urls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);

        return urls;
    })();

    useEffect(() => {
        setCurrentIndex(0);
        setHasError(false);
    }, [logo, company, website, domain]);

    const handleImageError = useCallback(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < logoUrls.length) {
            setCurrentIndex(nextIndex);
        } else {
            setHasError(true);
            if (onLogoFallback) onLogoFallback();
        }
    }, [currentIndex, logoUrls.length, onLogoFallback]);

    const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;

        // Google Favicon returns a default 16x16 globe when domain has no favicon
        // If image is very small AND it's from Google Favicons, skip it
        const src = logoUrls[currentIndex] || '';
        if (src.includes('google.com/s2/favicons') && img.naturalWidth <= 16) {
            handleImageError(); // Skip tiny default favicons
            return;
        }

        if (onLogoSuccess) onLogoSuccess();
    }, [currentIndex, logoUrls, onLogoSuccess, handleImageError]);

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const getFallbackInitials = (name: string) => {
        if (!name) return "?";
        const cleaned = name.trim();
        const words = cleaned.split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        } else if (cleaned.length >= 2) {
            return cleaned.substring(0, 2).toUpperCase();
        }
        return cleaned.substring(0, 1).toUpperCase();
    };

    if (hasError) {
        return (
            <div className={cn(
                sizeClasses[size],
                className,
                "rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm"
            )}>
                <span className={size === "sm" ? "text-xs" : size === "md" ? "text-sm" : size === "lg" ? "text-base" : "text-lg"}>
                    {getFallbackInitials(company)}
                </span>
            </div>
        );
    }

    return (
        <div className={cn(
            sizeClasses[size],
            "rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex items-center justify-center p-1 relative",
            className
        )}>
            <img
                src={logoUrls[currentIndex]}
                alt={company}
                className="w-full h-full object-contain rounded-md"
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>
    );
}
