
"use client";

import { useEffect, useRef, useState } from "react";
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
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSelectPlan = async (planName: string) => {
        if (planName === currentPlan) return;

        try {
            setLoadingPlan(planName);
            const response = await fetch("/api/subscription/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ plan: planName }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to create checkout session:", errorText);
                alert(`Error: ${errorText || "Could not start checkout. Please try again."}`);
                setLoadingPlan(null);
                return;
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            } else {
                console.error("No URL returned from checkout session");
                alert("Something went wrong. Please check your network connection.");
                setLoadingPlan(null);
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("An unexpected error occurred. Please try again.");
            setLoadingPlan(null);
        }
    };

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
        // Checking if the click was on the backdrop div (which we can identify by lack of propagation from child)
        if (e.target === overlayRef.current) {
            onClose();
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

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-50 pointer-events-auto"
                >
                    <div className="sticky top-0 left-0 w-full h-[100dvh] flex items-center justify-center p-4">
                        <div
                            ref={overlayRef}
                            className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-md transition-all duration-300"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) onClose();
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-5xl bg-background rounded-xl shadow-2xl border relative z-10 my-4 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4 rounded-full opacity-70 hover:opacity-100 z-10"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            <div className="p-6 text-center space-y-1">
                                <h2 className="text-2xl font-bold">Invest in Your Career</h2>
                                <p className="text-muted-foreground text-sm">Choose the plan that fits your career goals.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 p-5 pt-0">
                                {plans.map((plan) => {
                                    const Icon = plan.icon;
                                    const isCurrent = plan.name === "Starter" && currentPlan === "Starter" ? true : (currentPlan === "Pro" && plan.name === "Break into Tech");

                                    return (
                                        <div
                                            key={plan.name}
                                            className={cn(
                                                "rounded-xl border p-6 flex flex-col relative transition-all duration-200",
                                                plan.popular ? "border-primary shadow-md bg-primary/5" : "bg-card hover:bg-accent/5",
                                                isCurrent ? "ring-2 ring-primary border-primary bg-primary/5" : ""
                                            )}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg px-3 py-0.5 text-xs">
                                                        Most Popular
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={cn("p-2 rounded-lg bg-muted/50 shadow-sm", plan.color.replace('text-', 'bg-').replace('500', '100 dark:bg-opacity-20'))}>
                                                    <Icon className={cn("w-5 h-5", plan.color)} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-base leading-tight">{plan.name}</h3>
                                                    {plan.popular && <span className="text-[10px] text-primary font-medium uppercase tracking-wide">Recommended</span>}
                                                </div>
                                            </div>

                                            <div className="mb-4 space-y-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                                                    {plan.period && (
                                                        <span className="text-muted-foreground font-medium text-sm">{plan.period}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed min-h-[32px]">{plan.description}</p>
                                            </div>

                                            <Button
                                                className={cn(
                                                    "w-full font-bold mb-6 shadow-sm transition-all h-9 text-sm",
                                                    plan.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 shadow-lg" : "",
                                                    !plan.popular && !isCurrent ? "bg-secondary/50 hover:bg-secondary text-secondary-foreground" : "",
                                                    isCurrent ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 opacity-100" : ""
                                                )}
                                                variant={isCurrent ? "outline" : (plan.popular ? "default" : "outline")}
                                                disabled={isCurrent || loadingPlan !== null}
                                                onClick={() => handleSelectPlan(plan.name)}
                                            >
                                                {isCurrent ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 mr-1.5" /> Current Plan
                                                    </>
                                                ) : (loadingPlan === plan.name ? "Processing..." : plan.buttonText)}
                                            </Button>

                                            <div className="space-y-3 flex-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What's included</p>
                                                {plan.features.map((feature, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-xs group">
                                                        <Check className={cn("w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors group-hover:text-primary", plan.color)} />
                                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
