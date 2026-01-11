"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Star, TrendingUp, Sparkles } from "lucide-react";
import RotatingText from "./ui/RotatingText";
import Silk from "./ui/Silk";

export function AuthSidePanel() {
    return (
        <div
            className="relative h-full w-full overflow-hidden bg-[#101012] text-white"
            style={{ borderBottomRightRadius: '200px' }}
        >

            {/* Silk Background */}
            <div className="absolute inset-0 z-0 animate-in fade-in duration-1000">
                <Silk
                    speed={5}
                    scale={1}
                    color="#7B7481"
                    noiseIntensity={1.5}
                    rotation={0}
                />
            </div>

            {/* Pattern Overlay  - Optional, maybe distracting over hyperspeed, kept very subtle */}
            <div className="absolute inset-0 opacity-[0.05] bg-[url('/grid.svg')] z-[2] pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">

                {/* Header Text */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md shadow-sm">
                        <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                        <span>Job Success Guaranteed</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight flex flex-col items-center gap-2">
                        <span>Start building your</span>
                        <div className="flex justify-center w-full">
                            <RotatingText
                                texts={['career', 'future', 'dreams']}
                                mainClassName="px-3 bg-[#3b82f6] text-white overflow-hidden py-1 justify-center rounded-xl inline-flex text-3xl md:text-4xl"
                                staggerFrom="last"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "-120%" }}
                                staggerDuration={0.025}
                                splitLevelClassName="overflow-hidden"
                                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                rotationInterval={2000}
                            />
                        </div>
                    </h2>

                    <p className="text-indigo-100/80 text-sm max-w-xs mx-auto mt-4">
                        Join 10,000+ developers who landed jobs at top tech companies using DebugCV.
                    </p>
                </div>

                {/* VISUALS: Floating Cards - SCALED DOWN (0.75x) */}
                <div className="relative w-full max-w-xs h-[450px] transform scale-90 md:scale-75 origin-top">

                    {/* Card 1: Hired (Top Right - Sube un poco) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
                        transition={{
                            default: { duration: 0.8, type: "spring" },
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl z-30 w-56"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 shrink-0">
                                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-900 font-bold text-sm leading-tight">You&apos;re Hired!</div>
                                <div className="text-gray-500 text-[10px] flex items-center gap-1">
                                    Contract Received <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Interview (Middle Left - Baja un poco) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0, y: [0, 12, 0] }}
                        transition={{
                            default: { delay: 0.2, duration: 0.8 },
                            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute top-[40%] -left-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-20 w-64"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                <svg viewBox="0 0 24 24" className="w-5 h-5">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm leading-tight">Interview Invitation</div>
                                <div className="text-indigo-200 text-[10px]">Technical Round • Tomorrow</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Profile Views (Bottom Right - Derecha) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: [0, -6, 0] }}
                        transition={{
                            default: { delay: 0.4, duration: 0.8 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute bottom-8 -right-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg z-10 w-56"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-200">
                                    <TrendingUp className="w-3 h-3" />
                                </div>
                                <span className="text-white font-bold text-xs">Profile Views</span>
                            </div>
                            <span className="text-green-300 text-[10px] font-bold bg-green-500/10 px-1.5 py-0.5 rounded">+128%</span>
                        </div>
                        {/* Mini Sparkline Chart */}
                        <div className="h-8 w-full flex items-end gap-1">
                            {[40, 60, 45, 70, 65, 85, 80, 100].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${h}%` }}
                                    transition={{ delay: 0.5 + (i * 0.05) }}
                                    className="flex-1 bg-gradient-to-t from-purple-500/50 to-purple-300 rounded-t-sm opacity-80"
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
