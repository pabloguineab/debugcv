"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, X, RefreshCw, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCompanyDomain, getInstitutionDomain } from "@/lib/logo-utils";

interface CompanyLogoInputProps {
    value?: string;
    onChange: (url: string) => void;
    companyName: string;
    website?: string;
    type: "company" | "institution";
    className?: string;
}

export function CompanyLogoInput({
    value,
    onChange,
    companyName,
    website,
    type,
    className
}: CompanyLogoInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    // Auto-fetch logo when company name changes (debounced)
    useEffect(() => {
        if (!companyName || value) return; // Don't overwrite existing value unless cleared

        const timer = setTimeout(() => {
            fetchLogo();
        }, 1500); // Wait 1.5s after typing stops

        return () => clearTimeout(timer);
    }, [companyName, website]);

    const fetchLogo = async () => {
        if (!companyName) return;

        setIsFetching(true);
        setFetchError(false);
        try {
            const domain = type === "company"
                ? getCompanyDomain(companyName, website)
                : getInstitutionDomain(companyName, website);

            if (!domain) {
                // If we can't guess a domain, we can't fetch
                setIsFetching(false);
                return;
            }

            // Use our proxy to fetch and get base64 directly
            // We use the proxy route but ask for base64 response? 
            // Actually, we can just fetch the proxy URL and convertblob to base64 here on client
            const targetUrl = `https://logo.clearbit.com/${domain}`;
            const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(targetUrl)}`;

            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error("Fetch failed");

            const blob = await response.blob();
            if (blob.size < 50) throw new Error("Image too small");

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                if (base64 && base64.startsWith("data:image")) {
                    onChange(base64); // Save the Base64 string directly!
                } else {
                    setFetchError(true);
                }
                setIsFetching(false);
            };
            reader.readAsDataURL(blob);

        } catch (error) {
            console.warn("Auto-fetch logo failed:", error);
            setFetchError(true);
            setIsFetching(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    onChange(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="relative group shrink-0">
                <div
                    className="w-10 h-10 rounded overflow-hidden border bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to upload logo manually"
                >
                    {value ? (
                        <img src={value} alt="Logo" className="w-full h-full object-contain p-0.5 bg-white" />
                    ) : (
                        <Building2 className="w-5 h-5 text-muted-foreground opacity-50" />
                    )}
                </div>

                {/* Status Indicator Overlay */}
                {isFetching && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    </div>
                )}

                {/* Remove Button */}
                {value && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                )}
            </div>

            <div className="flex-1">
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="xs"
                        className="h-6 text-[10px] text-muted-foreground hover:text-primary px-2"
                        onClick={fetchLogo}
                        disabled={isFetching || !companyName}
                    >
                        <RefreshCw className={cn("w-3 h-3 mr-1", isFetching && "animate-spin")} />
                        {fetchError ? "Retry Auto-Fetch" : "Auto-Fetch Logo"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="xs"
                        className="h-6 text-[10px] text-muted-foreground hover:text-primary px-2"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Upload
                    </Button>
                </div>
                {fetchError && !value && (
                    <p className="text-[10px] text-red-500 mt-0.5 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Could not auto-fetch. Try uploading manually.
                    </p>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
}
