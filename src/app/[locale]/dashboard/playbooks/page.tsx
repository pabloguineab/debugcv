'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Building2, Briefcase, Check } from 'lucide-react';
import Image from 'next/image';
import { companiesData, rolesData } from '@/lib/company-data';
import { CompanyResult } from '@/types/company';
import { useTranslations } from 'next-intl';
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
    const [radius, setRadius] = useState(260); // Slightly larger than prev "compact"
    const [logoSize, setLogoSize] = useState(75); // Slightly larger logos

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width < 768) {
                setRadius(140);
                setLogoSize(48);
            } else if (width < 1500 || height < 900) {
                // Laptop
                setRadius(240); // Increased significantly
                setLogoSize(85); // Increased significantly
            } else {
                // Desktop
                setRadius(320);
                setLogoSize(100);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = () => {
        if (selectedCompany && selectedRole) {
            // Encode manually to avoid issues with special chars
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
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 pb-20 md:pb-40 font-sans bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

            {/* Premium Light Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-radial from-blue-100/50 to-transparent blur-3xl opacity-40 md:opacity-100" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full bg-gradient-radial from-indigo-100/50 to-transparent blur-3xl opacity-40 md:opacity-100" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center pt-20 md:pt-0">

                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8 md:mb-12 relative px-4 z-30"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-blue-50 border border-blue-100 mb-4 md:mb-6 shadow-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                        <span className="text-xs md:text-sm font-bold text-blue-600 tracking-wide">{t('subtitle')}</span>
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 md:mb-5 leading-tight">
                        <span className="text-slate-900">
                            {t('title')}
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-medium px-2">
                        {t('description_part1')}<span className="text-blue-600 font-bold">{t('description_highlight')}</span>{t('description_part2')}
                    </p>
                </motion.div>

                {/* Search Animation Container */}
                <div className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center">

                    {/* Logos */}
                    {displayedCompanies.map((company, index) => {
                        const position = getCirclePosition(company.angle, radius);
                        return (
                            <motion.div
                                key={company.name}
                                className="absolute group cursor-pointer"
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
                                whileHover={{ scale: 1.2, zIndex: 20 }}
                                onClick={() => {
                                    setSelectedCompany(company.name);
                                    setSelectedCompanyLogo(company.localLogo);
                                }}
                            >
                                <div className="relative w-full h-full rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm border border-slate-100 flex items-center justify-center p-3">
                                    <Image src={company.localLogo} alt={company.name} fill className="object-contain p-1" />
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Central Search Bar - Using Shadcn/Base-UI Comboboxes */}
                    <div className="relative z-50 w-full max-w-3xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center gap-1 p-1.5 bg-white rounded-2xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100">

                            {/* Company Combobox */}
                            <div className="w-full md:flex-1 relative group pl-2">
                                <Combobox
                                    value={selectedCompany}
                                    onValueChange={(val) => {
                                        if (val) {
                                            setSelectedCompany(String(val));
                                            setSelectedCompanyLogo(`https://cdn.brandfetch.io/${String(val).toLowerCase().replace(/\s+/g, '')}.com/w/400/h/400`);
                                        }
                                    }}
                                    onInputValueChange={setCompanyQuery}
                                >
                                    <div className="relative flex items-center px-2 hover:bg-slate-50 rounded-xl transition-colors h-11 md:h-12">
                                        <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                                        <ComboboxInput
                                            placeholder={t('search_placeholder_company')}
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium h-full placeholder:text-slate-400 outline-none"
                                        />
                                    </div>
                                    <ComboboxContent align="start" className="w-[var(--radix-combobox-trigger-width)] md:w-80 p-0 overflow-hidden rounded-xl shadow-xl border-slate-200 z-50 bg-white">
                                        <ComboboxList className="max-h-64 p-2 overflow-y-auto">
                                            {displayedDropdownCompanies.length === 0 && (
                                                <ComboboxEmpty className="py-4 text-center text-slate-500 text-sm">
                                                    {t('no_roles')}
                                                </ComboboxEmpty>
                                            )}
                                            {displayedDropdownCompanies.map((company) => (
                                                <ComboboxItem
                                                    key={company.name}
                                                    value={company.name}
                                                    className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-blue-50 data-[highlighted]:bg-blue-50"
                                                >
                                                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center mr-3 shrink-0 text-xs">
                                                        {company.name[0]}
                                                    </div>
                                                    <span className="font-medium text-slate-700">{company.name}</span>
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>

                            {/* Separator (Desktop) */}
                            <div className="hidden md:block w-px h-8 bg-slate-200 mx-1" />

                            {/* Role Combobox */}
                            <div className="w-full md:flex-1 relative group">
                                <Combobox
                                    value={selectedRole}
                                    onValueChange={(val) => setSelectedRole(String(val))}
                                    onInputValueChange={setRoleQuery}
                                >
                                    <div className="relative flex items-center px-2 hover:bg-slate-50 rounded-xl transition-colors h-11 md:h-12">
                                        <Briefcase className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                                        <ComboboxInput
                                            placeholder={t('search_placeholder_role')}
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium h-full placeholder:text-slate-400 outline-none"
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
                                    h-11 md:h-12 px-6 rounded-xl md:rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap w-full md:w-auto
                                    ${selectedCompany && selectedRole
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                `}
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span className="hidden md:inline">{t('search_button')}</span>
                                <span className="md:hidden">Buscar</span>
                            </motion.button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
