"use client";

import { useState, useEffect } from "react";

interface CompanyLogoProps {
    company: string;
    logo?: string;
    website?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function CompanyLogo({ company, logo, website, size = "md", className = "" }: CompanyLogoProps) {
    const [logoSrc, setLogoSrc] = useState<string | null>(logo || null);
    const [hasError, setHasError] = useState(false);
    const [triedFallback, setTriedFallback] = useState(false);

    // Helper to get domain from URL or name
    const getDomain = () => {
        const lowerCompany = company.toLowerCase().trim();

        // Manual overrides for tricky massive companies (incomplete list compared to full but enough for logic)
        const overrides: Record<string, string> = {
            'royal bank of canada': 'rbc.com',
            'rbc': 'rbc.com',
            'td': 'td.com',
            'td bank': 'td.com',
            'scotiabank': 'scotiabank.com',
            'bmo': 'bmo.com',
            'bank of montreal': 'bmo.com',
            'cibc': 'cibc.com',
            'shopify': 'shopify.com',
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
            'amd': 'amd.com',
            'nvidia': 'nvidia.com',
            'samsung': 'samsung.com',
            'lg': 'lg.com',
            'sony': 'sony.com',
            'dell': 'dell.com',
            'hp': 'hp.com',
            'lenovo': 'lenovo.com',
            'asus': 'asus.com',
            'acer': 'acer.com',
            'cisco': 'cisco.com',
            'lobclaw': 'loblaw.ca',
            'loblaw': 'loblaw.ca',
            'rogers': 'rogers.com',
            'bell': 'bell.ca',
            'telus': 'telus.com',
            'manulife': 'manulife.com',
            'sun life': 'sunlife.com',
            'intuit': 'intuit.com',
            'square': 'squareup.com',
            'block': 'block.xyz',
            'coinbase': 'coinbase.com',
            'binance': 'binance.com',
            'kraken': 'kraken.com',
            'gemini': 'gemini.com',
            'hbc': 'hbc.com',
            'canadian tire': 'canadiantire.ca',
            'shoppers drug mart': 'shoppersdrugmart.ca',
            'tim hortons': 'timhortons.com',
            'mcdonalds': 'mcdonalds.com',
            'burger king': 'bk.com',
            'wendys': 'wendys.com',
            'subway': 'subway.com',
            'starbucks': 'starbucks.com',
            'accenture': 'accenture.com',
            'deloitte': 'deloitte.com',
            'kpmg': 'kpmg.com',
            'pwc': 'pwc.com',
            'ey': 'ey.com',
            'capgemini': 'capgemini.com',
            'infosys': 'infosys.com',
            'tata': 'tata.com',
            'tcs': 'tcs.com',
            'wipro': 'wipro.com',
            'cognizant': 'cognizant.com',
            'cgi': 'cgi.com',
            'ep counting': 'ep.com',
            'real chemistry': 'realchemistry.com',
            'lyft': 'lyft.com',
            'zoom': 'zoom.us',
            'slack': 'slack.com',
            'atlassian': 'atlassian.com',
            'dropbox': 'dropbox.com',
            'pinterest': 'pinterest.com',
            'reddit': 'reddit.com',
            'tiktok': 'tiktok.com',
            'snapchat': 'snap.com',
            'snap': 'snap.com',
            'spotify': 'spotify.com',
        };

        if (overrides[lowerCompany]) return overrides[lowerCompany];

        if (website) {
            try {
                const url = new URL(website.startsWith('http') ? website : `https://${website}`);
                return url.hostname;
            } catch (e) {
                // invalid url, fall through to company name heuristic
            }
        }

        // Fallback to heuristic based on company name
        const cleanName = lowerCompany
            .replace(/ inc\.?$/, '')
            .replace(/ corp\.?$/, '')
            .replace(/ corporation$/, '')
            .replace(/ llc$/, '')
            .replace(/ ltd\.?$/, '')
            .replace(/ limited$/, '')
            .replace(/ bank$/, '') // careful with this one, but usually safe for domain guessing
            .trim()
            .replace(/\s+/g, ''); // remove remaining spaces

        return cleanName.includes('.') ? cleanName : `${cleanName}.com`;
    };

    const domain = getDomain();

    // Effect to reset/init logic
    useEffect(() => {
        // Re-check override logic here to decide priority (simplified from original)
        const lowerCompany = company.toLowerCase().trim();
        // ... (skipping full override list check as getDomain handles it, logic here was to decide trust level)

        // Simplified Logic: Always try Brandfetch if logo missing or if we suspect local fallback
        if (logo) {
            setLogoSrc(logo);
            setTriedFallback(false);
            setHasError(false);
        } else {
            setLogoSrc(`https://cdn.brandfetch.io/${domain}/w/400/h/400`);
            setTriedFallback(true);
            setHasError(false);
        }
    }, [logo, company, website, domain]);

    const handleImageError = () => {
        // If we were trying the provided logo and it failed
        if (logo && !triedFallback) {
            setLogoSrc(`https://cdn.brandfetch.io/${domain}/w/400/h/400`);
            setTriedFallback(true);
        } else {
            // Brandfetch failed or we were already using it
            setHasError(true);
        }
    };

    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    const getFallbackInitials = (name: string) => {
        if (!name) return "?";
        const cleaned = name.trim();
        const words = cleaned.split(/\s+/).filter(w => w.length > 0);

        if (words.length >= 2) {
            // First letter of first word + First letter of second word
            return (words[0][0] + words[1][0]).toUpperCase();
        } else if (cleaned.length >= 2) {
            // First two letters of the single word
            return cleaned.substring(0, 2).toUpperCase();
        } else {
            // Fallback for single letter
            return cleaned.substring(0, 1).toUpperCase();
        }
    };

    if (hasError) {
        return (
            <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold shadow-md border border-slate-600 ring-1 ring-white/10 ${className}`}>
                <span className={size === "sm" ? "text-base" : size === "md" ? "text-lg" : "text-xl"}>
                    {getFallbackInitials(company)}
                </span>
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center p-1.5 relative hover:border-blue-300 hover:shadow-md transition-all duration-300 ${className}`}>
            <img
                src={logoSrc || undefined}
                alt={company}
                className="w-full h-full object-contain rounded-md"
                onError={handleImageError}
            />
        </div>
    );
}
