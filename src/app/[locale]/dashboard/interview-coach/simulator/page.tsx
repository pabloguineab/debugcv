'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, PhoneOff, Volume2, ArrowLeft, Cpu, Signal, Loader2 } from 'lucide-react';
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
    const [isActive, setIsActive] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('Ready');
    const [sessionError, setSessionError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const jobId = searchParams.get('jobId');
    const videoRef = useRef<HTMLVideoElement>(null);
    const sessionRef = useRef<any>(null);

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

    const startSession = useCallback(async () => {
        setIsConnecting(true);
        setSessionError(null);
        setConnectionStatus('Creating session...');

        try {
            // 1. Get session token from our backend
            console.log("Requesting session token...");
            const tokenRes = await fetch('/api/interview/session-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Context is handled backend side or default
                }),
            });

            if (!tokenRes.ok) {
                const errorData = await tokenRes.json();
                console.error("Token creation failed:", errorData);
                const errorMessage = errorData.details && typeof errorData.details === 'string'
                    ? errorData.details
                    : (errorData.error || 'Failed to create session token');
                throw new Error(errorMessage);
            }

            const { sessionToken } = await tokenRes.json();
            console.log("Session token received");

            setConnectionStatus('Conectando con el avatar...');

            // 2. Create LiveAvatar session using SDK dynamically imported
            const { LiveAvatarSession, SessionEvent, SessionState } = await import('@heygen/liveavatar-web-sdk');

            const session = new LiveAvatarSession(sessionToken, {
                voiceChat: true,
            });

            sessionRef.current = session;

            // 3. Listen for events
            session.on(SessionEvent.SESSION_STATE_CHANGED, (state: any) => {
                console.log("Session state changed:", state);
                if (state === SessionState.CONNECTED) {
                    setConnectionStatus('Conectado');
                    setIsConnecting(false);
                    setIsActive(true);
                } else if (state === SessionState.CONNECTING) {
                    setConnectionStatus('Conectando...');
                } else if (state === SessionState.DISCONNECTED) {
                    setConnectionStatus('Desconectado');
                    setIsActive(false);
                    setIsConnecting(false);
                }
            });

            session.on(SessionEvent.SESSION_STREAM_READY, () => {
                console.log("Stream ready, attaching to video element");
                if (videoRef.current) {
                    session.attach(videoRef.current);
                }
            });

            session.on(SessionEvent.SESSION_DISCONNECTED, (reason: any) => {
                console.log("Session disconnected, reason:", reason);
                setIsActive(false);
                setIsConnecting(false);
                setConnectionStatus('Desconectado');
            });

            // 4. Start the session
            await session.start();

        } catch (error: any) {
            console.error("Error starting LiveAvatar session:", error);
            setSessionError(error.message || 'Error al iniciar la sesión');
            setIsConnecting(false);
            setConnectionStatus('Error');
        }
    }, []);

    const endSession = useCallback(async () => {
        try {
            if (sessionRef.current) {
                await sessionRef.current.stop();
                sessionRef.current = null;
            }
        } catch (error) {
            console.error("Error stopping session:", error);
        }
        setIsActive(false);
        setIsConnecting(false);
        setConnectionStatus('Ready');
        router.push('/dashboard');
    }, [router]);

    const toggleMic = useCallback(() => {
        if (sessionRef.current && isActive) {
            if (isMicOn) {
                sessionRef.current.stopListening();
            } else {
                sessionRef.current.startListening();
            }
        }
        setIsMicOn(!isMicOn);
    }, [isMicOn, isActive]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                sessionRef.current.stop().catch(console.error);
                sessionRef.current = null;
            }
        };
    }, []);

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

    // --- RESTORED DESIGN (Old Look & Feel) ---
    return (
        <div className="min-h-screen overflow-hidden font-sans">
            {/* Background Effects - only in dark mode (RESTORED) */}
            <div className="absolute inset-0 z-0 dark:block hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            {/* Header (RESTORED POSITION: top-14) */}
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
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400 dark:bg-slate-600'}`} />
                            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                                {isActive ? 'Live' : isConnecting ? connectionStatus : 'Ready'}
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

            {/* Main Content (RESTORED PADDING/LAYOUT) */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 pt-20 pb-24">

                {/* Avatar Container (RESTORED MAX-W-4XL) */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-4xl aspect-video bg-gray-100 dark:bg-slate-900/80 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl backdrop-blur-sm"
                >
                    {/* Video element for LiveAvatar SDK (Replaces Iframe) */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover bg-slate-900 z-10"
                        style={{ display: isActive ? 'block' : 'none' }}
                    />

                    {/* Connecting State */}
                    {isConnecting && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/90 backdrop-blur-md z-20">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                            <p className="text-xs text-muted-foreground font-medium">{connectionStatus}</p>
                        </div>
                    )}

                    {/* Error State */}
                    {sessionError && !isConnecting && !isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/90 backdrop-blur-md z-20">
                            <div className="text-center max-w-sm">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                                    <PhoneOff className="w-5 h-5 text-red-500" />
                                </div>
                                <p className="text-sm text-red-500 font-medium mb-4">{sessionError}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startSession}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all"
                                >
                                    Try Again
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* Idle State - Start Button */}
                    <AnimatePresence>
                        {!isActive && !isConnecting && !sessionError && (
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

                {/* Controls Bar - (RESTORED STYLE) */}
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
