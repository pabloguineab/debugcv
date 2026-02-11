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

// Job board domains to filter out
const JOB_BOARD_DOMAINS = [
    'linkedin', 'indeed', 'glassdoor', 'ziprecruiter', 'monster',
    'infojobs', 'wellfound', 'angel.co', 'simplyhired', 'careerbuilder'
];

function isJobBoardDomain(domain: string): boolean {
    const lower = domain.toLowerCase();
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
        'nextlane': 'nextlane.com',
        'tecdata': 'tecdata.es',
    };

    if (overrides[lowerCompany]) return overrides[lowerCompany];

    // Try to extract from website if valid and NOT a job board
    if (website) {
        try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`);
            const hostname = url.hostname.replace(/^www\./, '');

            // If the website is actually a job board (e.g. linkedin.com/jobs/...), DO NOT use it
            if (!isJobBoardDomain(hostname)) {
                return hostname;
            }
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
    const [retryWithSearch, setRetryWithSearch] = useState(false);

    const domain = getDomain(company, website);

    // Build ordered list of logo URLs to try
    const logoUrls = (() => {
        const urls: string[] = [];
        const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || '';

        // 1. Logo.dev using provided or guessed domain
        // Add a timestamp to bust cache if we are retrying with a new domain found via search
        // (Logic handled in useEffect below, here we just push the base one)
        urls.push(`https://img.logo.dev/${domain}?token=${token}&size=128&format=png`);

        // 2. API-provided logo (Fallback)
        if (logo && !isJobBoardDomain(logo)) {
            urls.push(logo);
        }

        return urls;
    })();

    useEffect(() => {
        setCurrentIndex(0);
        setHasError(false);
        setRetryWithSearch(false);
    }, [logo, company, website, domain]);

    // Function to search for correct domain via Logo.dev Search API
    const findCorrectDomain = async (companyName: string) => {
        try {
            const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
            if (!token) return null;

            const res = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(companyName)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) return null;

            const data = await res.json();
            // data is Array<{ domain: string, name: string, ... }>

            if (Array.isArray(data) && data.length > 0) {
                // Return first domain that is NOT a job board
                const validMatch = data.find((item: any) => !isJobBoardDomain(item.domain));
                return validMatch ? validMatch.domain : null;
            }
            return null;
        } catch (err) {
            console.error("Logo search failed", err);
            return null;
        }
    };

    const handleImageError = useCallback(async () => {
        const nextIndex = currentIndex + 1;

        if (nextIndex < logoUrls.length) {
            setCurrentIndex(nextIndex);
        } else if (!retryWithSearch) {
            // All URLs failed, try to SEARCH for the domain
            setRetryWithSearch(true); // Prevent infinite loop
            const correctDomain = await findCorrectDomain(company);

            if (correctDomain && correctDomain !== domain) {
                // Found a better domain! Try loading that image directly
                const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || '';
                const newUrl = `https://img.logo.dev/${correctDomain}?token=${token}&size=128&format=png`;

                // Manually set this new URL as the one to try. 
                // We can't push to logoUrls since it's derived, but we can restart the chain or just force render?
                // Easier: Create a state for 'foundLogoUrl'
                setFoundLogoUrl(newUrl);
            } else {
                setHasError(true);
                if (onLogoFallback) onLogoFallback();
            }
        } else {
            setHasError(true);
            if (onLogoFallback) onLogoFallback();
        }
    }, [currentIndex, logoUrls.length, retryWithSearch, company, domain, onLogoFallback]);

    // State for a discovered logo URL (via search)
    const [foundLogoUrl, setFoundLogoUrl] = useState<string | null>(null);

    // If we found a logo via search, use that instead of the list
    const activeUrl = foundLogoUrl || logoUrls[currentIndex];

    const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;

        // Reject tiny/pixelated images - initials look better than blurry icons
        if (img.naturalWidth < 40 || img.naturalHeight < 40) {
            handleImageError();
            return;
        }

        if (onLogoSuccess) onLogoSuccess();
    }, [onLogoSuccess, handleImageError]);

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
