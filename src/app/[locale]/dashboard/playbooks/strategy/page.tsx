'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from "@/components/Logo";
import {
    Building2,
    Briefcase,
    CheckCircle2,
    Clock,
    Target,
    Zap,
    ArrowLeft,
    Lock,
    BrainCircuit,
    Users,
    Trophy,
    Database,
    X
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { getStrategyOverview, getStrategyQuestions, type StrategyData, type StrategyOverview } from '@/app/actions/get-strategy';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

// Initialize Stripe (Replace with your actual public key env var)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_sample_key_replace_me");

function StrategyContent() {
    const t = useTranslations('playbook.strategy');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const router = useRouter();

    const company = searchParams.get('company');
    const role = searchParams.get('role');
    const logoParam = searchParams.get('logo');

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<StrategyData | StrategyOverview | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [priceDisplay, setPriceDisplay] = useState("1.99€");
    const [paymentAmount, setPaymentAmount] = useState(199);
    const [paymentCurrency, setPaymentCurrency] = useState("eur");

    const handleCardPayment = async () => {
        setLoadingPayment(true);
        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 199 }), // Default fallback
            });
            const data = await res.json();

            if (data.amount && data.currency) {
                const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.amount / 100);
                setPriceDisplay(formatted);
                setPaymentAmount(data.amount);
                setPaymentCurrency(data.currency);
            }

            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error("Error creating payment intent:", error);
        } finally {
            setLoadingPayment(false);
        }
    };

    // Auto-init payment when modal opens
    useEffect(() => {
        if (showPayment && !clientSecret && !loadingPayment) {
            handleCardPayment();
        }
    }, [showPayment, clientSecret, loadingPayment]); // Added dependencies for lint correctness

    useEffect(() => {
        async function fetchData() {
            if (company && role) {
                try {
                    // 1. Fetch Overview (Fast)
                    const overview = await getStrategyOverview(company, role, locale);
                    if (overview) {
                        setData(overview);
                        setLoading(false); // Valid to show UI now

                        // 2. Fetch Questions (Bg)
                        const questions = await getStrategyQuestions(company, role, locale);
                        setData(prev => prev ? { ...prev, questions } : null);
                    }
                } catch (error) {
                    console.error("Failed to fetch strategy", error);
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [company, role, locale]);

    if (!company || !role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('missing_data')}</h2>
                    <button
                        onClick={() => router.push('/dashboard/playbooks')}
                        className="text-blue-600 hover:underline"
                    >
                        {t('back_to_search')}
                    </button>
                </div>
            </div>
        );
    }

    // Default fallback if API fails
    const strategyData: StrategyData = (data as StrategyData) || {
        difficulty: t('mock_data.algorithms').includes("LeetCode") ? "Hard" : "Alta", // Simple heuristic or just keep string
        avgProcessWeeks: 6,
        interviewStages: 5,
        keyValues: [
            t('mock_data.customer_obsession'),
            t('mock_data.think_big'),
            t('mock_data.bias_for_action')
        ],
        focusAreas: [
            { title: t('mock_data.system_design'), importance: 90 },
            { title: t('mock_data.algorithms'), importance: 85 },
            { title: t('mock_data.leadership'), importance: 70 },
        ],
        steps: [
            { title: t('steps.recruiter_screen'), desc: t('steps.recruiter_screen_desc') },
            { title: t('steps.technical_screen'), desc: t('steps.technical_screen_desc') },
            { title: t('steps.onsite_loop'), desc: t('steps.onsite_loop_desc') },
            { title: t('steps.hiring_committee'), desc: t('steps.hiring_committee_desc') }
        ],
        questions: [
            t('mock_questions.q1'),
            t('mock_questions.q2'),
            t('mock_questions.q3')
        ]
    };

    return (
        <div className={`w-full font-sans ${loading ? 'h-[calc(100vh-56px)] overflow-y-hidden flex flex-col' : ''}`}>

            {/* Header / Hero Section */}
            <div className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">

                <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center p-3 relative overflow-hidden"
                            >
                                <Image
                                    src={logoParam || `https://cdn.brandfetch.io/${company.toLowerCase().replace(/\s+/g, '')}.com/w/400/h/400`}
                                    alt={company}
                                    width={56}
                                    height={56}
                                    className="object-contain rounded-lg"
                                    onError={(e) => {
                                        // Fallback si no carga la imagen
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement?.classList.add('bg-blue-100');
                                    }}
                                />
                                <Building2 className="w-10 h-10 text-blue-600 absolute opacity-0" style={{ opacity: 0 }} />
                            </motion.div>

                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 mb-2"
                                >
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{company}</h1>
                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-200">
                                        {t('confidential_report')}
                                    </span>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex items-center text-slate-500 dark:text-slate-400 text-base font-medium"
                                >
                                    <Briefcase className="w-5 h-5 mr-2 text-slate-400" />
                                    {t('strategy_for')} <span className="text-slate-800 dark:text-white font-bold ml-1">{role}</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={`max-w-7xl mx-auto px-6 ${loading ? 'flex-1 flex items-center justify-center' : 'pt-6'}`}>

                {loading ? (
                    <LoadingState company={company} role={role} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column: Key Stats */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Quick Stats Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700"
                            >
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                    <Zap className="w-4 h-4 text-amber-500 mr-2" />
                                    {t('overview')}
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{t('difficulty')}</p>
                                                <p className="text-sm text-slate-900 dark:text-white font-semibold">{strategyData.difficulty}</p>
                                            </div>
                                        </div>
                                        {(() => {
                                            const diff = strategyData.difficulty.toLowerCase();
                                            let width = "w-[50%]";
                                            let color = "bg-amber-500";
                                            // let bgIcon = "bg-amber-100";
                                            // let textIcon = "text-amber-600";

                                            if (diff.includes("muy alta") || diff.includes("very high") || diff.includes("très élevée") || diff.includes("molto alta")) {
                                                width = "w-[95%]";
                                                color = "bg-purple-600";
                                                // bgIcon = "bg-purple-100";
                                                // textIcon = "text-purple-600";
                                            } else if (diff.includes("alta") || diff.includes("high") || diff.includes("élevée")) {
                                                width = "w-[75%]";
                                                color = "bg-red-500";
                                                // bgIcon = "bg-red-100";
                                                // textIcon = "text-red-600";
                                            } else if (diff.includes("media") || diff.includes("medium") || diff.includes("moyenne")) {
                                                width = "w-[50%]";
                                                color = "bg-yellow-500";
                                                // bgIcon = "bg-yellow-100";
                                                // textIcon = "text-yellow-600";
                                            } else {
                                                width = "w-[25%]";
                                                color = "bg-green-500";
                                                // bgIcon = "bg-green-100";
                                                // textIcon = "text-green-600";
                                            }

                                            return (
                                                <div className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${color} ${width} transition-all duration-500`} />
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{t('duration')}</p>
                                                <p className="text-sm text-slate-900 dark:text-white font-semibold">~{strategyData.avgProcessWeeks} {t('weeks')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{t('stages')}</p>
                                                <p className="text-sm text-slate-900 dark:text-white font-semibold">{strategyData.interviewStages} {t('interviews')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Focus Areas */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />

                                <h3 className="text-sm font-semibold mb-4 flex items-center relative z-10">
                                    <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
                                    {t('critical_focus_areas')}
                                </h3>

                                <div className="space-y-5 relative z-10">
                                    {strategyData.focusAreas.map((area, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm font-medium mb-2">
                                                <span className="text-slate-200">{area.title}</span>
                                                <span className="text-blue-300">{area.importance}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${area.importance}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Detailed Strategy */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* The Process Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700"
                            >
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                    <BrainCircuit className="w-4 h-4 text-indigo-600 mr-2" />
                                    {t('interview_process')}
                                </h3>

                                <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-700 space-y-4">
                                    {(strategyData.steps || []).map((step, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-3 border-indigo-500 shadow-sm" />
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Locked Content Teaser */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-1 overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-700"
                            >
                                <div className="p-5 pb-0">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                                        <Lock className="w-4 h-4 text-slate-400 mr-2" />
                                        {t('recent_questions')}
                                        <span className={`ml-2 text-xs font-medium ${strategyData.questions ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : 'text-blue-600 bg-blue-50 border-blue-100'} px-2 py-0.5 rounded-full border flex items-center justify-center min-w-[1.5rem]`}>
                                            {strategyData.questions ? (
                                                strategyData.questions.length
                                            ) : (
                                                <div className="w-2.5 h-2.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                        {t('recent_questions_desc')}
                                    </p>
                                </div>

                                <div className="relative">
                                    {isUnlocked ? (
                                        <div className="px-5 pb-5 space-y-3">
                                            {(strategyData.questions || []).map((q, i) => (
                                                <div key={i} className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20 flex gap-2 items-start">
                                                    <div className="mt-0.5 w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{q}</p>
                                                </div>
                                            ))}

                                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-lg flex items-center gap-2">
                                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">{t('report_unlocked')}</p>
                                                    <p className="text-xs text-green-600 dark:text-green-400/80">{t('report_unlocked_desc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-5 pb-5 space-y-3 filter blur-sm select-none opacity-50">
                                                {(strategyData.questions || [1, 2, 3]).slice(0, 3).map((q, i) => (
                                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                                        <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                                            {typeof q === 'string' ? q.substring(0, 20) + "..." : "Loading question data placeholder..."}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/80 dark:from-slate-800 dark:via-slate-800/95 to-transparent">
                                                <button
                                                    onClick={() => setShowPayment(true)}
                                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                    {t('unlock_full_report')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>

                        </div>
                    </div>
                )
                }
            </div >

            {/* Payment Notification/Modal */}
            <AnimatePresence>
                {
                    showPayment && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowPayment(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <button
                                        onClick={() => setShowPayment(false)}
                                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center mt-2">
                                    <Logo className="w-36 h-auto mb-6" />

                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t('payment_modal.title')}</h3>
                                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                        {t('payment_modal.subtitle', { company })}
                                    </p>

                                    <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-600 font-medium">{t('payment_modal.full_report')}</span>
                                            <span className="text-indigo-600 font-bold">{priceDisplay}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 text-left">
                                            {t('payment_modal.price_desc')}
                                        </div>
                                    </div>

                                    <div className="space-y-3 w-full">
                                        {/* Auto-load Stripe Elements */}
                                        {clientSecret ? (
                                            <Elements
                                                options={{ clientSecret, appearance: { theme: 'stripe' }, locale: 'en' }}
                                                stripe={stripePromise}
                                            >
                                                <CheckoutForm
                                                    onSuccess={() => {
                                                        setShowPayment(false);
                                                        setIsUnlocked(true);
                                                    }}
                                                    amount={paymentAmount}
                                                    currency={paymentCurrency}
                                                    clientSecret={clientSecret}
                                                />
                                            </Elements>
                                        ) : (
                                            <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                                                <p className="text-sm font-medium">{t('payment_modal.initializing')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

        </div >
    );
}

function LoadingState({ company, role }: { company: string; role: string }) {
    const t = useTranslations('playbook.strategy');
    const [step, setStep] = useState(0);

    // Steps that imply fetching EXISTING data
    const steps = [
        t('loading_state.connecting'),
        t('loading_state.searching_dossier', { company }),
        t('loading_state.recovering_questions')
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center max-w-md text-center px-6"
            >
                <div className="relative mb-8">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-50/50" />
                        <Database className="w-8 h-8 text-blue-600 relative z-10" />
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-blue-100/50"
                            initial={{ height: "0%" }}
                            animate={{ height: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    {/* Status Dot */}
                    <div className="absolute -right-1 -top-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                </div>

                <div className="min-h-[60px] flex items-center justify-center mb-6">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={step}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-lg font-medium text-slate-700"
                        >
                            {steps[step]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Standard Progress Bar */}
                <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "5%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "easeInOut" }}
                        className="h-full bg-blue-600 rounded-full"
                    />
                </div>

                <p className="text-sm text-slate-400 mt-4">
                    {t('loading_state.recovering_data')}
                </p>
            </motion.div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function StrategyPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <StrategyContent />
        </Suspense>
    );
}
