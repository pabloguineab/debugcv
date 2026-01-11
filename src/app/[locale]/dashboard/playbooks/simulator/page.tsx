'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, PhoneOff, Volume2, ArrowLeft, Cpu, Signal } from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { CompanyLogo } from '@/components/CompanyLogo';

interface Application {
    id: string;
    title: string;
    company: string;
    status: string;
    location?: string;
    salary?: string;
    jobDescription?: string;
}

// Wrapper component to handle Suspense
export default function SimulatorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Cargando simulador...</p>
                </div>
            </div>
        }>
            <SimulatorContent />
        </Suspense>
    );
}

function SimulatorContent() {
    const [isActive, setIsActive] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // const [embedId, setEmbedId] = useState<string>(""); // Store dynamic ID -> Disabled to force stable embed
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
                const res = await fetch(`/api/job-tracker/${jobId}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Simulator: Application data received:", data);
                    setApplication(data);
                } else {
                    console.error("Simulator: Failed to fetch application", res.status);
                }

                // 2. Setup Interview Context (LiveAvatar)
                // This call prepares the AI with the specific CV and Job Description
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
                        console.log("Simulator: Context/Embed ID received:", setupData.contextId);
                        // setEmbedId(setupData.contextId); // Context ID != Embed ID often. Sticking to known working Embed ID.
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

    // Use stable ID provided by user
    const EMBED_ID = "883e7954-fc94-4e8b-a7d7-9a67eeff0d6c";
    // const targetEmbedId = embedId || EMBED_ID; 
    const embedUrl = `https://embed.liveavatar.com/v1/${EMBED_ID}`;

    const startSession = () => {
        setIsActive(true);
    };

    const endSession = () => {
        setIsActive(false);
        router.push('/dashboard/playbooks'); // Redirect to playbooks dashboard
    };

    const toggleMic = () => {
        setIsMicOn(!isMicOn);
    };

    // Show loading if we're fetching job data
    if (jobId && isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Cargando datos de la entrevista...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-indigo-500/30">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Company Logo or Default Icon */}
                    {application?.company ? (
                        <CompanyLogo company={application.company} size="sm" />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Cpu className="w-6 h-6 text-white" />
                        </div>
                    )}

                    <div>
                        <h1 className="font-bold text-lg tracking-tight">
                            {application ? `${application.title} - ${application.company}` : 'AI Interview Simulator'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                                {isActive ? 'Live' : 'Ready'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md flex items-center gap-3 text-sm text-slate-400">
                        <Signal className="w-4 h-4 text-green-500" />
                        <span>Secure</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 h-screen flex flex-col items-center justify-center p-6 pt-36 md:pt-24 pb-32">

                {/* Avatar Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-5xl aspect-video bg-slate-900/80 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-sm"
                >
                    {/* Iframe (se carga cuando isActive = true) */}
                    {isActive && (
                        <iframe
                            src={embedUrl}
                            allow="microphone; camera; autoplay; encrypted-media; fullscreen"
                            title="LiveAvatar Embed"
                            className="absolute inset-0 w-full h-full bg-slate-900 z-10"
                            style={{ border: 'none' }}
                        />
                    )}

                    {/* Idle State - Botón de inicio */}
                    <AnimatePresence>
                        {!isActive && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md z-20"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startSession}
                                    className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3"
                                >
                                    <Video className="w-6 h-6" />
                                    Iniciar Entrevista
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
                                        <h3 className="text-white font-bold text-lg">Entrevistador Senior</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                            </span>
                                            <span className="text-indigo-300 text-sm font-medium">Escuchando...</span>
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

                {/* Controls Bar - Justo debajo del video */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="mt-8 flex items-center gap-4 p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-50"
                        >
                            <button
                                onClick={toggleMic}
                                className={`p-4 rounded-xl transition-all ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                            >
                                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </button>

                            <button className="p-4 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all">
                                <Volume2 className="w-6 h-6" />
                            </button>

                            <div className="w-px h-8 bg-slate-700 mx-2" />

                            <button
                                onClick={endSession}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                            >
                                <PhoneOff className="w-5 h-5" />
                                Finalizar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
