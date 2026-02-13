
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Crown, Rocket, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

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
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string>("");
    const [subscriptionId, setSubscriptionId] = useState<string>("");
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedPlan(null);
            setClientSecret("");
            setSubscriptionId("");
            setPaymentError(null);
            setLoadingPlan(null);
        }
    }, [open]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                if (selectedPlan) {
                    // Go back to plan selection instead of closing
                    setSelectedPlan(null);
                    setClientSecret("");
                    setPaymentError(null);
                } else {
                    onClose();
                }
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose, selectedPlan]);

    const handleSelectPlan = async (planName: string) => {
        if (planName === currentPlan || planName === "Starter") return;

        try {
            setLoadingPlan(planName);
            setPaymentError(null);

            const response = await fetch("/api/subscription/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ plan: planName }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setPaymentError(data.error || "Could not start checkout. Please try again.");
                setLoadingPlan(null);
                return;
            }

            const data = await response.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setSubscriptionId(data.subscriptionId);
                setSelectedPlan(planName);
            } else {
                setPaymentError("Something went wrong. Please try again.");
            }
            setLoadingPlan(null);
        } catch (error) {
            console.error("Error creating subscription:", error);
            setPaymentError("An unexpected error occurred. Please try again.");
            setLoadingPlan(null);
        }
    };

    const handlePaymentSuccess = () => {
        // Payment succeeded! Close modal and reload to reflect Pro status
        onClose();
        window.location.reload();
    };

    const handleBackToPlans = () => {
        setSelectedPlan(null);
        setClientSecret("");
        setSubscriptionId("");
        setPaymentError(null);
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

    // Find the selected plan details
    const selectedPlanDetails = plans.find(p => p.name === selectedPlan);

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
                                if (e.target === e.currentTarget) {
                                    if (selectedPlan) {
                                        handleBackToPlans();
                                    } else {
                                        onClose();
                                    }
                                }
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                                "bg-background rounded-xl shadow-2xl border relative z-10 my-4 max-h-[90vh] overflow-y-auto",
                                selectedPlan ? "w-full max-w-md" : "w-full max-w-5xl"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4 rounded-full opacity-70 hover:opacity-100 z-10"
                                onClick={() => {
                                    if (selectedPlan) {
                                        handleBackToPlans();
                                    } else {
                                        onClose();
                                    }
                                }}
                            >
                                {selectedPlan ? <ArrowLeft className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </Button>

                            {/* ===== PAYMENT VIEW ===== */}
                            {selectedPlan && selectedPlanDetails ? (
                                <div className="p-6 flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>

                                    <h2 className="text-xl font-bold mb-1">Subscribe to {selectedPlanDetails.name}</h2>
                                    <p className="text-muted-foreground text-sm mb-6">Complete your payment below</p>

                                    {/* Plan summary */}
                                    <div className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">{selectedPlanDetails.name}</span>
                                            <span className="text-primary font-bold">{selectedPlanDetails.price}{selectedPlanDetails.period}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Recurring monthly subscription. Cancel anytime.
                                        </div>
                                    </div>

                                    {/* Stripe Elements Payment Form */}
                                    <div className="w-full">
                                        {clientSecret ? (
                                            <Elements
                                                options={{
                                                    clientSecret,
                                                    appearance: { theme: "stripe" },
                                                }}
                                                stripe={stripePromise}
                                            >
                                                <CheckoutForm
                                                    onSuccess={handlePaymentSuccess}
                                                    amount={selectedPlanDetails.name === "Break into Tech" ? 1900 : 14900}
                                                    clientSecret={clientSecret}
                                                />
                                            </Elements>
                                        ) : (
                                            <div className="w-full py-12 flex flex-col items-center justify-center text-muted-foreground">
                                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                                                <p className="text-sm font-medium">Initializing secure payment...</p>
                                            </div>
                                        )}
                                    </div>

                                    {paymentError && (
                                        <div className="mt-4 text-red-500 text-sm text-center">{paymentError}</div>
                                    )}
                                </div>
                            ) : (
                                /* ===== PLAN SELECTION VIEW ===== */
                                <>
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
                                                        ) : (loadingPlan === plan.name ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Processing...
                                                            </>
                                                        ) : plan.buttonText)}
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

                                    {paymentError && (
                                        <div className="px-5 pb-4 text-red-500 text-sm text-center">{paymentError}</div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
