'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Building2, Briefcase, Check } from 'lucide-react';
import Image from 'next/image';
import { companiesData, rolesData } from '@/lib/company-data';
import { CompanyResult } from '@/types/company';
import { useTranslations } from 'next-intl';
import { Badge } from "@/components/ui/badge";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@/components/ui/combobox';

// Logos flotantes (burbujas visuales solamente - estáticas para decoración)
const displayedCompanies = [
    { name: 'Google', domain: 'google.com', angle: 0, localLogo: '/logos/google.png' },
    { name: 'Meta', domain: 'meta.com', angle: 30, localLogo: '/logos/meta.png' },
    { name: 'LinkedIn', domain: 'linkedin.com', angle: 60, localLogo: '/logos/linkedin.png' },
    { name: 'Microsoft', domain: 'microsoft.com', angle: 90, localLogo: '/logos/microsoft.png' },
    { name: 'Netflix', domain: 'netflix.com', angle: 120, localLogo: '/logos/netflix.png' },
    { name: 'Apple', domain: 'apple.com', angle: 150, localLogo: '/logos/apple.png' },
    { name: 'Amazon', domain: 'amazon.com', angle: 180, localLogo: '/logos/amazon.png' },
    { name: 'Tesla', domain: 'tesla.com', angle: 210, localLogo: '/logos/tesla.png' },
    { name: 'Spotify', domain: 'spotify.com', angle: 240, localLogo: '/logos/spotify.png' },
    { name: 'Uber', domain: 'uber.com', angle: 270, localLogo: '/logos/uber.png' },
    { name: 'Airbnb', domain: 'airbnb.com', angle: 300, localLogo: '/logos/airbnb.png' },
    { name: 'Stripe', domain: 'stripe.com', angle: 330, localLogo: '/logos/stripe.png' },
];

const roles = rolesData;

const getCirclePosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
        x: Math.cos(radian) * radius,
        y: Math.sin(radian) * radius,
    };
};

export default function PlaybookPage() {
    const t = useTranslations('playbook');
    const router = useRouter();

    // Selection States
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedCompanyLogo, setSelectedCompanyLogo] = useState<string | null>(null);

    // Filter States
    const [companyQuery, setCompanyQuery] = useState('');
    const [roleQuery, setRoleQuery] = useState('');

    // API Results (Mocked/Local for now mixed)
    const [apiCompanies, setApiCompanies] = useState<CompanyResult[]>([]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (companyQuery.length >= 2) {
                // In future: setApiCompanies(await searchCompanies(companyQuery));
            } else {
                setApiCompanies([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [companyQuery]);

    // Derived Lists
    const localFiltered = companiesData
        .filter(c => c.toLowerCase().includes(companyQuery.toLowerCase()))
        .slice(0, 50)
        .map(c => ({ name: c, domain: '', logo: null }));

    const displayedDropdownCompanies = (companyQuery.length >= 2 && apiCompanies.length > 0)
        ? apiCompanies
        : localFiltered;

    const filteredRoles = roles.filter(r =>
        r.toLowerCase().includes(roleQuery.toLowerCase())
    );

    // Responsive Animation Vars
    const [radius, setRadius] = useState(240); // Initial guess
    const [logoSize, setLogoSize] = useState(85); // Initial guess

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width < 768) {
                setRadius(140);
                setLogoSize(48);
            } else if (width < 1500 || height < 900) {
                // Laptop
                setRadius(220); // Open radius for breathing room
                setLogoSize(60); // Clean visible size
            } else {
                // Desktop
                setRadius(300);
                setLogoSize(80); // Standard size
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = () => {
        if (selectedCompany && selectedRole) {
            const params = new URLSearchParams();
            params.set('company', selectedCompany);
            params.set('role', selectedRole);
            if (selectedCompanyLogo) {
                params.set('logo', selectedCompanyLogo);
            }
            router.push(`/dashboard/playbooks/strategy?${params.toString()}`);
        }
    };

    return (
        <div className="relative flex flex-1 flex-col gap-6 p-4 md:p-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto w-full flex flex-col flex-1 h-full"
            >
                {/* Header Standardized to match Dashboard Layout (ATS Score / Application Board) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-0">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-blue-600" />
                            {t('title')}
                            <Badge variant="secondary" className="ml-2 text-blue-600 bg-blue-100 dark:bg-blue-900/30">
                                Pro
                            </Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Access insider-proven strategies.
                        </p>
                    </div>
                </div>

                {/* Central Search Section - Takes remaining space */}
                <div className="flex-1 flex items-center justify-center relative min-h-[500px] w-full">

                    {/* Background Animation Glows - Subtle and clean */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-blue-100/30 to-transparent blur-3xl opacity-50" />
                    </div>

                    {/* Orbiting Logos */}
                    {displayedCompanies.map((company, index) => {
                        const position = getCirclePosition(company.angle, radius);
                        return (
                            <motion.div
                                key={company.name}
                                className="absolute group cursor-pointer z-10"
                                style={{ width: logoSize, height: logoSize }}
                                initial={{ opacity: 0, scale: 0.3 }}
                                animate={{
                                    x: [position.x, position.x + Math.cos((company.angle * Math.PI) / 180) * 15, position.x],
                                    y: [position.y, position.y + Math.sin((company.angle * Math.PI) / 180) * 15, position.y],
                                    opacity: 1,
                                    scale: 1,
                                }}
                                transition={{
                                    x: { duration: 7 + index * 0.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                                    y: { duration: 7 + index * 0.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                                    opacity: { duration: 0.8, delay: index * 0.06 },
                                    scale: { duration: 0.8, delay: index * 0.06 }
                                }}
                                whileHover={{ scale: 1.2, zIndex: 30 }}
                                onClick={() => {
                                    setSelectedCompany(company.name);
                                    setSelectedCompanyLogo(company.localLogo);
                                }}
                            >
                                <div className="relative w-full h-full rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-slate-100 flex items-center justify-center p-3">
                                    <Image src={company.localLogo} alt={company.name} fill className="object-contain p-1 rounded-lg" />
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Search Bar Island */}
                    <div className="relative z-50 w-full max-w-2xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800">

                            {/* Company Combobox */}
                            <div className="w-full md:flex-1 relative group pl-2">
                                <Combobox
                                    value={selectedCompany}
                                    onValueChange={(val) => {
                                        if (val) {
                                            const companyName = String(val);
                                            setSelectedCompany(companyName);
                                            // Always try to fetch logo for selected company
                                            setSelectedCompanyLogo(`https://cdn.brandfetch.io/${companyName.toLowerCase().replace(/\s+/g, '')}.com/w/400/h/400`);
                                        }
                                    }}
                                    onInputValueChange={setCompanyQuery}
                                >
                                    <div className="relative flex items-center px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors h-12 md:h-14">
                                        {selectedCompany && selectedCompanyLogo ? (
                                            <div className="relative w-10 h-10 mr-3 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-100">
                                                <Image
                                                    src={selectedCompanyLogo}
                                                    alt={selectedCompany}
                                                    fill
                                                    className="object-contain rounded-md"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        target.parentElement!.classList.remove('border', 'bg-white');
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <Building2 className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                                        )}
                                        <ComboboxInput
                                            placeholder={t('search_placeholder_company')}
                                            className="w-full bg-transparent border-none focus:ring-0 text-base font-medium h-full placeholder:text-slate-400 dark:text-white outline-none truncate"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && companyQuery.length > 1) {
                                                    e.preventDefault();
                                                    setSelectedCompany(companyQuery);
                                                    setSelectedCompanyLogo(`https://cdn.brandfetch.io/${companyQuery.toLowerCase().replace(/\s+/g, '')}.com/w/400/h/400`);
                                                }
                                            }}
                                        />
                                    </div>
                                    <ComboboxContent align="start" className="w-[var(--radix-combobox-trigger-width)] md:w-80 p-0 overflow-hidden rounded-xl shadow-xl border-slate-200 z-50 bg-white">
                                        <ComboboxList className="max-h-64 p-2 overflow-y-auto">
                                            {/* Custom "Use [Company]" Option */}
                                            {companyQuery.length > 1 && (
                                                <ComboboxItem
                                                    value={companyQuery}
                                                    className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-blue-50 data-[highlighted]:bg-blue-50 mb-1 border-b border-slate-50"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0 text-blue-600">
                                                        <Sparkles className="w-3 h-3" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 text-sm">{t('use_company', { company: companyQuery })}</span>
                                                        <span className="text-xs text-slate-400">{t('search_company_desc')}</span>
                                                    </div>
                                                </ComboboxItem>
                                            )}

                                            {displayedDropdownCompanies.map((company) => (
                                                <ComboboxItem
                                                    key={company.name}
                                                    value={company.name}
                                                    className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-blue-50 data-[highlighted]:bg-blue-50"
                                                >
                                                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center mr-3 shrink-0 text-xs text-slate-500 font-medium">
                                                        {company.name[0]}
                                                    </div>
                                                    <span className="font-medium text-slate-700 text-sm">{company.name}</span>
                                                </ComboboxItem>
                                            ))}

                                            {displayedDropdownCompanies.length === 0 && companyQuery.length < 2 && (
                                                <ComboboxEmpty className="py-2 text-center text-slate-400 text-xs">
                                                    {t('start_typing')}
                                                </ComboboxEmpty>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>

                            {/* Separator (Desktop) */}
                            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                            {/* Role Combobox */}
                            <div className="w-full md:flex-1 relative group">
                                <Combobox
                                    value={selectedRole}
                                    onValueChange={(val) => setSelectedRole(String(val))}
                                    onInputValueChange={setRoleQuery}
                                >
                                    <div className="relative flex items-center px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors h-12 md:h-14">
                                        <Briefcase className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                                        <ComboboxInput
                                            placeholder={t('search_placeholder_role')}
                                            className="w-full bg-transparent border-none focus:ring-0 text-base font-medium h-full placeholder:text-slate-400 dark:text-white outline-none"
                                        />
                                    </div>
                                    <ComboboxContent align="start" className="w-[var(--radix-combobox-trigger-width)] md:w-80 p-0 overflow-hidden rounded-xl shadow-xl border-slate-200 z-50 bg-white">
                                        <ComboboxList className="max-h-64 p-2 overflow-y-auto">
                                            {filteredRoles.length === 0 && (
                                                <ComboboxEmpty className="py-4 text-center text-slate-500 text-sm">
                                                    {t('no_roles')}
                                                </ComboboxEmpty>
                                            )}
                                            {filteredRoles.map((role) => (
                                                <ComboboxItem
                                                    key={role}
                                                    value={role}
                                                    className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-indigo-50 data-[highlighted]:bg-indigo-50"
                                                >
                                                    <span className="font-medium text-slate-700">{role}</span>
                                                    {selectedRole === role && <Check className="ml-auto w-4 h-4 text-indigo-600" />}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>

                            {/* Search Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSearch}
                                disabled={!selectedCompany || !selectedRole}
                                className={`
                                    h-12 md:h-14 px-8 rounded-xl md:rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap w-full md:w-auto
                                    ${selectedCompany && selectedRole
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                `}
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span className="hidden md:inline">{t('search_button')}</span>
                                <span className="md:hidden">Buscar</span>
                            </motion.button>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
