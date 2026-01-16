'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, PhoneOff, Volume2, ArrowLeft, Cpu, Signal } from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { CompanyLogo } from '@/components/company-logo';

interface Application {
    id: string;
    title: string;
    company: string;
    status: string;
    location?: string;
    jobDescription?: string;
}

// Wrapper component to handle Suspense
export default function SimulatorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs text-muted-foreground font-medium">Loading simulator...</p>
                </div>
            </div>
        }>
            <SimulatorContent />
        </Suspense>
    );
}

function SimulatorContent() {
    const [isActive, setIsActive] = useState(true); // Start directly
    const [isMicOn, setIsMicOn] = useState(true);
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const jobId = searchParams.get('jobId');

    useEffect(() => {
        const fetchApplication = async () => {
            if (!jobId) return;

            console.log("Simulator: Fetching application for jobId:", jobId);
            setIsLoading(true);
            try {
                // 1. Fetch application details
                const res = await fetch(`/api/applications/${jobId}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Simulator: Application data received:", data);
                    setApplication(data);
                } else {
                    console.error("Simulator: Failed to fetch application", res.status);
                }

                // 2. Setup Interview Context (LiveAvatar)
                const setupRes = await fetch('/api/interview/setup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId,
                        language: params.locale
                    })
                });

                if (setupRes.ok) {
                    const setupData = await setupRes.json();
                    if (setupData.contextId) {
                        console.log("Simulator: Context ID received:", setupData.contextId);
                    }
                }

            } catch (error) {
                console.error("Error fetching application or setting up interview:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplication();
    }, [jobId, params.locale]);

    // Use stable ID provided by user (LiveAvatar embed)
    const EMBED_ID = process.env.NEXT_PUBLIC_LIVE_AVATAR_EMBED_ID || "883e7954-fc94-4e8b-a7d7-9a67eeff0d6c";
    const embedUrl = `https://embed.liveavatar.com/v1/${EMBED_ID}`;

    const startSession = () => {
        setIsActive(true);
    };

    const endSession = () => {
        setIsActive(false);
        router.push('/dashboard/interview-coach');
    };

    const toggleMic = () => {
        setIsMicOn(!isMicOn);
    };

    // Show loading if we're fetching job data
    if (jobId && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs text-muted-foreground font-medium">Loading interview data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-hidden font-sans">

            {/* Background Effects - only in dark mode */}
            <div className="absolute inset-0 z-0 dark:block hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            {/* Header */}
            <header className="absolute top-14 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Company Logo or Default Icon */}
                    {application?.company ? (
                        <CompanyLogo company={application.company} size="lg" />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Cpu className="w-8 h-8 text-white" />
                        </div>
                    )}

                    <div>
                        <h1 className="font-semibold text-lg tracking-tight">
                            {application ? `${application.title} - ${application.company}` : 'AI Interview Simulator'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-slate-600'}`} />
                            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                                {isActive ? 'Live' : 'Ready'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-full bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 backdrop-blur-md flex items-center gap-3 text-sm text-muted-foreground">
                        <Signal className="w-4 h-4 text-green-500" />
                        <span>Secure</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 pt-20 pb-24">

                {/* Avatar Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-4xl aspect-video bg-gray-100 dark:bg-slate-900/80 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl backdrop-blur-sm"
                >
                    {/* Iframe (loads when isActive = true) */}
                    {isActive && (
                        <iframe
                            src={embedUrl}
                            allow="microphone; camera; autoplay; encrypted-media; fullscreen"
                            title="LiveAvatar Embed"
                            className="absolute inset-0 w-full h-full bg-slate-900 z-10"
                            style={{ border: 'none' }}
                        />
                    )}

                    {/* Idle State - Start Button */}
                    <AnimatePresence>
                        {!isActive && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/90 backdrop-blur-md z-20"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startSession}
                                    className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3"
                                >
                                    <Video className="w-6 h-6" />
                                    Start Interview
                                    <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Connected Overlay */}
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-20"
                        >
                            <div className="flex items-end justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                        AI
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Senior Interviewer</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                            </span>
                                            <span className="text-indigo-300 text-sm font-medium">Listening...</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Audio Visualizer */}
                                <div className="flex items-center gap-1 h-8">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [10, 24, 10] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                            className="w-1 bg-indigo-500 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Controls Bar - Below video */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="mt-4 flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg z-50"
                        >
                            <button
                                onClick={toggleMic}
                                className={`p-2.5 rounded-lg transition-all ${isMicOn ? 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                            >
                                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </button>

                            <button className="p-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
                                <Volume2 className="w-4 h-4" />
                            </button>

                            <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

                            <button
                                onClick={endSession}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all"
                            >
                                <PhoneOff className="w-3.5 h-3.5" />
                                End Session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
