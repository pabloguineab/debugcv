"use client";

import { useState, useEffect } from "react";
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

export function CompanyLogo({ company, logo, website, size = "md", className = "", onLogoSuccess, onLogoFallback }: CompanyLogoProps) {
    const [logoSrc, setLogoSrc] = useState<string | null>(logo || null);
    const [hasError, setHasError] = useState(false);
    const [triedFallback, setTriedFallback] = useState(false);

    // Helper to get domain from URL or name
    const getDomain = () => {
        const lowerCompany = company.toLowerCase().trim();

        // Manual overrides for major companies
        const overrides: Record<string, string> = {
            'vercel': 'vercel.com',
            'stripe': 'stripe.com',
            'figma': 'figma.com',
            'linear': 'linear.app',
            'notion': 'notion.so',
            'google': 'google.com',
            'amazon': 'amazon.com',
            'microsoft': 'microsoft.com',
            'meta': 'meta.com',
            'facebook': 'meta.com',
            'apple': 'apple.com',
            'netflix': 'netflix.com',
            'uber': 'uber.com',
            'airbnb': 'airbnb.com',
            'twitter': 'twitter.com',
            'x': 'twitter.com',
            'tesla': 'tesla.com',
            'ibm': 'ibm.com',
            'oracle': 'oracle.com',
            'salesforce': 'salesforce.com',
            'adobe': 'adobe.com',
            'intel': 'intel.com',
            'nvidia': 'nvidia.com',
            'spotify': 'spotify.com',
            'slack': 'slack.com',
            'atlassian': 'atlassian.com',
            'dropbox': 'dropbox.com',
            'github': 'github.com',
            'gitlab': 'gitlab.com',
            'shopify': 'shopify.com',
            'zoom': 'zoom.us',
            'lyft': 'lyft.com',
            'pinterest': 'pinterest.com',
            'reddit': 'reddit.com',
            'tiktok': 'tiktok.com',
            'snap': 'snap.com',
            'snapchat': 'snap.com',
            'linkedin': 'linkedin.com',
            'indeed': 'indeed.com',
            'paypal': 'paypal.com',
            'square': 'squareup.com',
            'coinbase': 'coinbase.com',
            'robinhood': 'robinhood.com',
            'cloudflare': 'cloudflare.com',
            'mongodb': 'mongodb.com',
            'datadog': 'datadoghq.com',
            'twilio': 'twilio.com',
            'hubspot': 'hubspot.com',
            'asana': 'asana.com',
            'monday': 'monday.com',
            'jira': 'atlassian.com',
            'trello': 'trello.com',
        };

        if (overrides[lowerCompany]) return overrides[lowerCompany];

        if (website) {
            try {
                const url = new URL(website.startsWith('http') ? website : `https://${website}`);
                return url.hostname;
            } catch (e) {
                // invalid url, fall through
            }
        }

        // Fallback: clean company name and append .com
        const cleanName = lowerCompany
            .replace(/ inc\.?$/, '')
            .replace(/ corp\.?$/, '')
            .replace(/ corporation$/, '')
            .replace(/ llc$/, '')
            .replace(/ ltd\.?$/, '')
            .replace(/ limited$/, '')
            .trim()
            .replace(/\s+/g, '');

        return cleanName.includes('.') ? cleanName : `${cleanName}.com`;
    };

    const domain = getDomain();

    useEffect(() => {
        // Try Clearbit first (better coverage for smaller companies)
        setLogoSrc(`https://logo.clearbit.com/${domain}`);
        setTriedFallback(false);
        setHasError(false);
    }, [logo, company, website, domain]);

    const handleImageError = () => {
        if (!triedFallback) {
            // Then try Brandfetch
            setLogoSrc(`https://cdn.brandfetch.io/${domain}/w/400/h/400`);
            setTriedFallback(true);
        } else if (logo && logoSrc !== logo) {
            // Finally try the provided logo from API
            setLogoSrc(logo);
        } else {
            setHasError(true);
            if (onLogoFallback) onLogoFallback();
        }
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;

        // Check dimensions first
        if (img.naturalWidth < 10 || img.naturalHeight < 10) {
            setHasError(true);
            if (onLogoFallback) onLogoFallback();
            return;
        }

        // Try to detect if image is transparent/empty using Canvas
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = 20;
                canvas.height = 20;
                ctx.drawImage(img, 0, 0, 20, 20);
                const imageData = ctx.getImageData(0, 0, 20, 20);
                const data = imageData.data;

                // Check if any pixel has significant opacity
                let hasVisiblePixels = false;
                for (let i = 3; i < data.length; i += 4) { // Check alpha channel every 4th byte
                    if (data[i] > 50) { // Alpha > 50 means somewhat visible
                        hasVisiblePixels = true;
                        break;
                    }
                }

                if (!hasVisiblePixels) {
                    // Image is mostly transparent - treat as failed
                    setHasError(true);
                    if (onLogoFallback) onLogoFallback();
                    return;
                }
            }
        } catch (err) {
            // CORS error or other issue - can't analyze, assume valid
            console.log('Cannot analyze image pixels, assuming valid');
        }

        if (onLogoSuccess) onLogoSuccess();
    };

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
        } else {
            return cleaned.substring(0, 1).toUpperCase();
        }
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
                crossOrigin="anonymous"
                src={logoSrc || undefined}
                alt={company}
                className="w-full h-full object-contain rounded-md"
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>
    );
}
