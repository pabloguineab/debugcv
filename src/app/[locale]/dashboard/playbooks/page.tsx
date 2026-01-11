'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Briefcase, Check, Sparkles, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { companiesData, rolesData } from '@/lib/company-data';
import { searchCompanies } from '@/app/actions/search-companies';
import { CompanyResult } from '@/types/company';
import { useTranslations } from 'next-intl';

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
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedCompanyLogo, setSelectedCompanyLogo] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState('');

    const [companySearch, setCompanySearch] = useState('');
    const [roleSearch, setRoleSearch] = useState('');

    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    // Estado para resultados de la API
    const [apiCompanies, setApiCompanies] = useState<CompanyResult[]>([]);
    // const [isSearching, setIsSearching] = useState(false); // Unused for now

    const companyRef = useRef<HTMLDivElement>(null);
    const roleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setShowCompanyDropdown(false);
            }
            if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
                setShowRoleDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Efecto para buscar empresas con debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (companySearch.length >= 2) {
                // Logic commented out to prevent suggestions in original code, enabling if desired or keeping consistent
                // const results = await searchCompanies(companySearch);
                // setApiCompanies(results);
            } else {
                setApiCompanies([]);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [companySearch]);

    // Combinar resultados: si hay búsqueda API, usarlos; si no, filtrar locales
    // Convertimos los locales al formato de la API para unificar el renderizado
    const localFiltered = companiesData
        .filter(c => c.toLowerCase().includes(companySearch.toLowerCase()))
        .slice(0, 50)
        .map(c => ({ name: c, domain: '', logo: null }));

    const displayedDropdownCompanies = (companySearch.length >= 2 && apiCompanies.length > 0)
        ? apiCompanies
        : localFiltered;

    const filteredRoles = roles.filter(r =>
        r.toLowerCase().includes(roleSearch.toLowerCase())
    );

    const [radius, setRadius] = useState(300);
    const [logoSize, setLogoSize] = useState(100);

    // Ajuste de radio para móvil y laptops
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width < 768) {
                setRadius(140);
                setLogoSize(45);
            } else if (width < 1500 || height < 900) {
                // Laptop / Pantallas medianas (Optimized for 14" MacBook Pro)
                setRadius(220); // Increased from 200
                setLogoSize(80); // Increased from 60 to make them pop
            } else {
                // Pantallas grandes
                setRadius(300);
                setLogoSize(90);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const inputHeight = "h-16 md:h-20"; // Responsive height

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 pb-32 md:pb-60 font-sans bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

            {/* Premium Light Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-radial from-blue-100/50 to-transparent blur-3xl opacity-40 md:opacity-100" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full bg-gradient-radial from-indigo-100/50 to-transparent blur-3xl opacity-40 md:opacity-100" />

                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full border border-blue-200/20"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[650px] h-[400px] md:h-[650px] rounded-full border border-indigo-200/15"
                    animate={{ scale: [1, 1.03, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>



            {/* Main Content */}
            <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center pt-20 md:pt-0">

                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6 md:mb-8 relative px-4 z-30"
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
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                    </motion.div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3 md:mb-5 leading-tight">
                        <span className="text-slate-900">
                            {t('title')}
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-medium mb-2 px-2">
                        {t('description_part1')}<span className="text-blue-600 font-bold">{t('description_highlight')}</span>{t('description_part2')}
                    </p>
                </motion.div>

                {/* Search Section Container */}
                <div className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center">

                    {/* Company Logos Flotantes */}
                    {displayedCompanies.map((company, index) => {
                        const position = getCirclePosition(company.angle, radius);

                        return (
                            <motion.div
                                key={company.name}
                                className="absolute group cursor-pointer"
                                style={{
                                    width: logoSize,
                                    height: logoSize,
                                }}
                                initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                                animate={{
                                    x: [position.x, position.x + Math.cos((company.angle * Math.PI) / 180) * 20, position.x],
                                    y: [position.y, position.y + Math.sin((company.angle * Math.PI) / 180) * 20, position.y],
                                    opacity: 1,
                                    scale: 1,
                                }}
                                transition={{
                                    x: {
                                        duration: 7 + index * 0.3,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut",
                                    },
                                    y: {
                                        duration: 7 + index * 0.3,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut",
                                    },
                                    opacity: { duration: 0.8, delay: index * 0.06 },
                                    scale: { duration: 0.8, delay: index * 0.06, type: "spring", stiffness: 200 },
                                }}
                                whileHover={{
                                    scale: 1.2,
                                    zIndex: 20,
                                    transition: { duration: 0.3, type: "spring", stiffness: 300 }
                                }}
                            >
                                <div className="relative w-full h-full rounded-2xl md:rounded-3xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100 flex items-center justify-center p-3 md:p-5">
                                    <div className="relative w-full h-full z-10">
                                        <Image
                                            src={company.localLogo}
                                            alt={company.name}
                                            fill
                                            className="object-contain p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Central Search Interface */}
                    <div className="relative z-50 w-full max-w-5xl mx-auto px-4">
                        <div className="relative flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-white/90 backdrop-blur-xl p-3 md:p-5 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200/60 ring-1 ring-slate-100">

                            {/* Company Input */}
                            <div className="relative w-full md:flex-1" ref={companyRef}>
                                <div
                                    className={`
                    flex items-center ${inputHeight} px-4 md:px-7 rounded-2xl transition-all duration-300 cursor-text
                    ${showCompanyDropdown
                                            ? 'bg-blue-50/50 border-2 border-blue-400/50 shadow-sm'
                                            : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}
                  `}
                                    onClick={() => setShowCompanyDropdown(true)}
                                >
                                    {selectedCompany ? (
                                        <div className="p-2 rounded-xl bg-white border border-blue-100 transition-all mr-3 md:mr-4 shadow-sm w-10 h-10 md:w-14 md:h-14 flex items-center justify-center overflow-hidden shrink-0">
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={selectedCompanyLogo || `https://cdn.brandfetch.io/${selectedCompany.toLowerCase().replace(/\s+/g, '')}.com/w/400/h/400`}
                                                    alt={selectedCompany}
                                                    fill
                                                    className="object-contain rounded-md"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement?.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = '<div class="p-2 md:p-3.5 rounded-xl md:rounded-2xl bg-blue-100 transition-all shadow-sm"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-2 md:p-3.5 rounded-xl md:rounded-2xl bg-blue-100 transition-all mr-3 md:mr-4 shrink-0">
                                            <Building2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col items-start justify-center overflow-hidden">
                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">{t('company_label')}</span>
                                        <input
                                            type="text"
                                            placeholder={t('search_placeholder_company')}
                                            className="w-full bg-transparent border-none outline-none text-slate-800 text-base md:text-lg font-semibold placeholder:text-slate-400 placeholder:font-medium truncate"
                                            value={companySearch}
                                            onChange={(e) => {
                                                setCompanySearch(e.target.value);
                                                setSelectedCompany('');
                                                setSelectedCompanyLogo(null);
                                                setShowCompanyDropdown(true);
                                            }}
                                            onFocus={() => {
                                                setShowCompanyDropdown(true);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && companySearch.trim()) {
                                                    setSelectedCompany(companySearch.trim());
                                                    setShowCompanyDropdown(false);
                                                    setTimeout(() => {
                                                        if (roleRef.current) {
                                                            const input = roleRef.current.querySelector('input');
                                                            input?.focus();
                                                        }
                                                        setShowRoleDropdown(true);
                                                    }, 100);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showCompanyDropdown && companySearch.trim().length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl max-h-[300px] overflow-hidden z-50 text-left"
                                        >
                                            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {companySearch && (
                                                    <motion.div
                                                        className="flex items-center px-4 py-3 hover:bg-blue-50/50 rounded-xl cursor-pointer transition-all group border-b border-slate-50 mb-1"
                                                        onClick={() => {
                                                            setSelectedCompany(companySearch);
                                                            setCompanySearch(companySearch);
                                                            setShowCompanyDropdown(false);
                                                            setSelectedCompanyLogo(`https://cdn.brandfetch.io/${companySearch.toLowerCase().replace(/\s+/g, '')}.com/w/400/h/400`);
                                                            setTimeout(() => {
                                                                if (roleRef.current) {
                                                                    const input = roleRef.current.querySelector('input');
                                                                    input?.focus();
                                                                }
                                                                setShowRoleDropdown(true);
                                                            }, 100);
                                                        }}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 shrink-0">
                                                            <Sparkles className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-slate-800 font-bold truncate">{t('use_company', { company: companySearch })}</span>
                                                            <span className="text-slate-400 text-[10px] md:text-xs truncate">{t('search_company_desc')}</span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Divider - Hidden on Mobile */}
                            <div className="hidden md:block w-px h-12 bg-slate-200/60" />

                            {/* Role Input */}
                            <div className="relative w-full md:flex-1" ref={roleRef}>
                                <div
                                    className={`
                    flex items-center ${inputHeight} px-4 md:px-7 rounded-2xl transition-all duration-300 cursor-text
                    ${showRoleDropdown
                                            ? 'bg-indigo-50/50 border-2 border-indigo-400/50 shadow-sm'
                                            : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}
                  `}
                                    onClick={() => setShowRoleDropdown(true)}
                                >
                                    <div className={`p-2 md:p-3.5 rounded-xl md:rounded-2xl ${selectedRole ? 'bg-indigo-600 shadow-md' : 'bg-indigo-100'} transition-all mr-3 md:mr-4 shrink-0`}>
                                        <Briefcase className={`w-5 h-5 md:w-6 md:h-6 ${selectedRole ? 'text-white' : 'text-indigo-600'}`} />
                                    </div>

                                    <div className="flex-1 flex flex-col items-start justify-center overflow-hidden">
                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">{t('role_label')}</span>
                                        <input
                                            type="text"
                                            placeholder={t('search_placeholder_role')}
                                            className="w-full bg-transparent border-none outline-none text-slate-800 text-base md:text-lg font-semibold placeholder:text-slate-400 placeholder:font-medium truncate"
                                            value={selectedRole || roleSearch}
                                            onChange={(e) => {
                                                setRoleSearch(e.target.value);
                                                setSelectedRole('');
                                                setShowRoleDropdown(true);
                                            }}
                                            onFocus={() => setShowRoleDropdown(true)}
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showRoleDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl max-h-[300px] overflow-hidden z-50 text-left"
                                        >
                                            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {filteredRoles.map((role, i) => (
                                                    <motion.div
                                                        key={role}
                                                        className="flex items-center px-4 py-3 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-all group"
                                                        onClick={() => {
                                                            setSelectedRole(role);
                                                            setRoleSearch('');
                                                            setShowRoleDropdown(false);
                                                        }}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.02 }}
                                                    >
                                                        <span className="text-slate-700 font-bold flex-1 text-left group-hover:text-indigo-600 transition-colors text-sm md:text-base">{role}</span>
                                                        {selectedRole === role && (
                                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                                                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Search Button */}
                            <motion.button
                                className={`
                  ${inputHeight} px-8 md:px-12 rounded-2xl font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 relative overflow-hidden w-full md:w-auto mt-2 md:mt-0
                  ${selectedCompany && selectedRole
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg cursor-pointer'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                `}
                                disabled={!selectedCompany || !selectedRole}
                                whileTap={{ scale: selectedCompany && selectedRole ? 0.96 : 1 }}
                                onClick={() => {
                                    if (selectedCompany && selectedRole) {
                                        const params = new URLSearchParams();
                                        params.set('company', selectedCompany);
                                        params.set('role', selectedRole);
                                        if (selectedCompanyLogo) {
                                            params.set('logo', selectedCompanyLogo);
                                        }
                                        router.push(`/dashboard/playbooks/strategy?${params.toString()}`);
                                    }
                                }}
                            >
                                {selectedCompany && selectedRole && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                                        initial={{ x: '100%' }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
                                <span className="relative z-10">{t('search_button')}</span>
                            </motion.button>

                        </div>
                    </div>

                </div>
            </div>


        </div>
    );

}
