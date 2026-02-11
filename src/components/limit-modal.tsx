"use client";

import { X, Lock, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface LimitModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpgrade: () => void;
    feature: string;
}

export function LimitModal({ open, onOpenChange, onUpgrade, feature }: LimitModalProps) {
    if (!open) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-md transition-all duration-300"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative z-50 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
                <div className="p-6 flex flex-col items-center text-center relative">
                    {/* Close Button */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Icon */}
                    <div className="mb-4 relative pt-2">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <Lock className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border border-blue-200 dark:border-blue-800/50 shadow-sm">
                            Pro Feature Limit
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-5 mb-2">
                        Unlock Unlimited Access
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed px-2">
                        You've reached the free limit for <span className="font-semibold text-gray-700 dark:text-gray-300">{feature}</span>. Upgrade to Pro to remove all limits and unlock premium features.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50 transition-colors">
                            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Unlimited Downloads</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-transparent hover:border-purple-100 dark:hover:border-purple-900/50 transition-colors">
                            <Crown className="w-5 h-5 text-purple-500 fill-purple-500" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Unlimited Scans</span>
                        </div>
                    </div>

                    {/* Upgrade Button */}
                    <Button
                        onClick={onUpgrade}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl h-12 text-base font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Zap className="w-4 h-4 mr-2 fill-white/20" /> Upgrade to Pro
                    </Button>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
