"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

// Country data with dial codes and flags
const countries = [
    { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
    { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
    { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
    { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
    { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
    { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
    { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
    { code: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
    { code: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
    { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
    { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
    { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
    { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
    { code: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
    { code: "FI", name: "Finland", dial: "+358", flag: "🇫🇮" },
    { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
    { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
    { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
    { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
    { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
    { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
    { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
    { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
    { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
    { code: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
    { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
    { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
    { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
    { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
    { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
    { code: "PE", name: "Peru", dial: "+51", flag: "🇵🇪" },
    { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
    { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
    { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
    { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
    { code: "TR", name: "Turkey", dial: "+90", flag: "🇹🇷" },
    { code: "RU", name: "Russia", dial: "+7", flag: "🇷🇺" },
    { code: "UA", name: "Ukraine", dial: "+380", flag: "🇺🇦" },
    { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
    { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
    { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
    { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
    { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
    { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
    { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
    { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
    { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
    { code: "TW", name: "Taiwan", dial: "+886", flag: "🇹🇼" },
    { code: "CZ", name: "Czech Republic", dial: "+420", flag: "🇨🇿" },
    { code: "RO", name: "Romania", dial: "+40", flag: "🇷🇴" },
    { code: "HU", name: "Hungary", dial: "+36", flag: "🇭🇺" },
    { code: "GR", name: "Greece", dial: "+30", flag: "🇬🇷" },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    defaultCountry?: string;
    placeholder?: string;
    className?: string;
}

export function PhoneInput({
    value,
    onChange,
    onBlur,
    defaultCountry = "ES",
    placeholder = "XX XX XX XX",
    className = ""
}: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(
        countries.find(c => c.code === defaultCountry) || countries[0]
    );
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse value to extract country code and number
    useEffect(() => {
        if (value && value.startsWith("+")) {
            // Try to find matching country from the phone number
            const matchedCountry = countries.find(c => value.startsWith(c.dial));
            if (matchedCountry && matchedCountry.code !== selectedCountry.code) {
                setSelectedCountry(matchedCountry);
            }
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCountries = countries.filter(
        c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.dial.includes(search) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleCountrySelect = (country: typeof countries[0]) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearch("");
        // Update the full phone number with new prefix
        const localNumber = getLocalNumber();
        onChange(localNumber ? `${country.dial} ${localNumber}` : "");
        inputRef.current?.focus();
    };

    const getLocalNumber = () => {
        if (!value) return "";
        // Remove the country dial code and any extra spaces
        const dialCode = selectedCountry.dial;
        let local = value.startsWith(dialCode) 
            ? value.slice(dialCode.length).trim() 
            : value.replace(/^\+\d+\s*/, "").trim();
        return local;
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/[^\d\s]/g, ""); // Only allow digits and spaces
        const fullNumber = inputValue ? `${selectedCountry.dial} ${inputValue}` : "";
        onChange(fullNumber);
    };

    return (
        <div className={`flex items-stretch ${className}`}>
            {/* Country Selector */}
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-full flex items-center gap-1.5 px-3 border border-r-0 rounded-l-lg bg-muted/30 hover:bg-muted/50 transition-colors min-w-[90px]"
                >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-sm text-muted-foreground">{selectedCountry.dial}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-popover border rounded-lg shadow-lg z-50 max-h-[280px] overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search country..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 rounded-md border-0 outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                        </div>
                        {/* Country List */}
                        <div className="overflow-y-auto max-h-[220px]">
                            {filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <span className="text-xl">{country.flag}</span>
                                    <span className="text-sm flex-1 truncate">{country.name}</span>
                                    <span className="text-sm text-muted-foreground">{country.dial}</span>
                                    {country.code === selectedCountry.code && (
                                        <Check className="size-4 text-blue-600" />
                                    )}
                                </button>
                            ))}
                            {filteredCountries.length === 0 && (
                                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                    No countries found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Phone Number Input */}
            <input
                ref={inputRef}
                type="tel"
                value={getLocalNumber()}
                onChange={handleNumberChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border rounded-r-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
        </div>
    );
}

// Helper function to parse phone number from CV text
export function parsePhoneNumber(phoneText: string): { dialCode: string; localNumber: string; fullNumber: string } | null {
    if (!phoneText) return null;
    
    // Clean the phone text
    const cleaned = phoneText.replace(/[\s\-\(\)\.]/g, "");
    
    // Try to match country code
    for (const country of countries) {
        const dialWithoutPlus = country.dial.replace("+", "");
        if (cleaned.startsWith("+") && cleaned.substring(1).startsWith(dialWithoutPlus)) {
            const localNumber = cleaned.substring(1 + dialWithoutPlus.length);
            return {
                dialCode: country.dial,
                localNumber: localNumber,
                fullNumber: `${country.dial} ${localNumber}`
            };
        }
        if (cleaned.startsWith(dialWithoutPlus)) {
            const localNumber = cleaned.substring(dialWithoutPlus.length);
            return {
                dialCode: country.dial,
                localNumber: localNumber,
                fullNumber: `${country.dial} ${localNumber}`
            };
        }
    }
    
    // If no country code found, return as-is
    return {
        dialCode: "",
        localNumber: cleaned,
        fullNumber: cleaned
    };
}
