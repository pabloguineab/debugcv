
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Crown, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UpgradePlanModalProps {
    open: boolean;
    onClose: () => void;
    currentPlan?: string;
}

export function UpgradePlanModal({
    open,
    onClose,
    currentPlan = "Starter",
}: UpgradePlanModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    const handleSelectPlan = (planName: string) => {
        // Here you would integrate with Stripe/Payment provider
        console.log("Selected plan:", planName);
        // For now, just close or show success (if intended)
        if (planName !== currentPlan) {
            // Redirect to checkout or something
            window.location.href = `/checkout?plan=${planName}`;
        }
    };

    const plans = [
        {
            name: "Starter",
            price: "FREE",
            description: "For developers who want to test the waters.",
            features: [
                "3 Free ATS Scans per month",
                "Job Tracker (Max 10 applications)",
                "Smart Job Search Access",
                "Standard Resume Templates"
            ],
            icon: Rocket,
            color: "text-blue-500",
            buttonText: "Current Plan",
            popular: false
        },
        {
            name: "Break into Tech",
            price: "$19",
            period: "/monthly",
            description: "For serious candidates to automate their search.",
            features: [
                "Unlimited ATS Scans & Optimization",
                "Unlimited Job Tracker",
                "AI Interview Coach",
                "Tech Interview Playbooks",
                "Smart CV Builder + AI Writer",
                "Premium Tech-Focused Templates"
            ],
            icon: Zap,
            color: "text-purple-500",
            buttonText: "Subscribe Now",
            popular: true
        },
        {
            name: "Climb the Ladder",
            price: "$149",
            period: "/monthly",
            description: "Personalized strategy and expert human feedback.",
            features: [
                "Everything in Pro Toolkit",
                "1-on-1 Expert Resume Audit",
                "Expert Content Rewrite",
                "LinkedIn Profile Optimization",
                "Personalized Career Strategy",
                "Direct WhatsApp/Email Access"
            ],
            icon: Crown,
            color: "text-amber-500",
            buttonText: "Subscribe Now",
            popular: false
        }
    ];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 overflow-y-auto"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-6xl bg-background rounded-xl shadow-2xl border relative my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 rounded-full opacity-70 hover:opacity-100 z-10"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="p-8 text-center space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Invest in Your Career</h2>
                            <p className="text-muted-foreground text-lg">Choose the plan that fits your career goals.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 p-6 md:p-8 pt-0">
                            {plans.map((plan) => {
                                const isCurrent = plan.name === currentPlan || (plan.name === "Break into Tech" && currentPlan === "Pro"); // Handle potential naming mismatch
                                const Icon = plan.icon;

                                return (
                                    <div
                                        key={plan.name}
                                        className={cn(
                                            "relative flex flex-col p-6 rounded-xl border-2 transition-all duration-300 bg-card/50 hover:bg-card hover:shadow-xl hover:-translate-y-1",
                                            plan.popular ? "border-primary/50 shadow-md scale-[1.02] z-10 bg-card" : "border-transparent hover:border-border/50",
                                            isCurrent ? "ring-2 ring-primary border-primary bg-primary/5" : ""
                                        )}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg px-4 py-1">
                                                    Most Popular
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={cn("p-3 rounded-xl bg-muted/50 shadow-sm", plan.color.replace('text-', 'bg-').replace('500', '100 dark:bg-opacity-20'))}>
                                                <Icon className={cn("w-6 h-6", plan.color)} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{plan.name}</h3>
                                                {plan.popular && <span className="text-xs text-primary font-medium">Recommended</span>}
                                            </div>
                                        </div>

                                        <div className="mb-6 space-y-2">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                                                {plan.period && (
                                                    <span className="text-muted-foreground font-medium">{plan.period}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">{plan.description}</p>
                                        </div>

                                        <Button
                                            className={cn(
                                                "w-full font-bold mb-8 shadow-sm transition-all h-11",
                                                plan.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 shadow-lg" : "",
                                                !plan.popular && !isCurrent ? "bg-secondary/50 hover:bg-secondary text-secondary-foreground" : "",
                                                isCurrent ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 opacity-100" : ""
                                            )}
                                            variant={isCurrent ? "outline" : (plan.popular ? "default" : "outline")}
                                            disabled={isCurrent}
                                            onClick={() => handleSelectPlan(plan.name)} // Pass function reference
                                        >
                                            {isCurrent ? (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" /> Current Plan
                                                </>
                                            ) : plan.buttonText}
                                        </Button>

                                        <div className="space-y-4 flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What's included</p>
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3 text-sm group">
                                                    <Check className={cn("w-4 h-4 mt-0.5 shrink-0 transition-colors group-hover:text-primary", plan.color)} />
                                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
