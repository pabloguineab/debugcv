'use client';

import React, { useState, useEffect } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements,
    PaymentRequestButtonElement
} from '@stripe/react-stripe-js';
import { Lock, Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import { PaymentRequest } from '@stripe/stripe-js';
import { useTranslations } from 'next-intl';

export default function CheckoutForm({ onSuccess, amount = 199, clientSecret }: { onSuccess?: () => void, amount?: number, clientSecret: string }) {
    const t = useTranslations('playbook.strategy.checkout');
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
    const [view, setView] = useState<'options' | 'card'>('options'); // 'options' (buttons) or 'card' (element)

    // Setup Payment Request (Apple Pay / Google Pay)
    useEffect(() => {
        if (!stripe) return;

        const pr = stripe.paymentRequest({
            country: 'ES',
            currency: 'eur',
            total: {
                label: 'DebugCV Strategy Report',
                amount: amount,
            },
            requestPayerName: true,
            requestPayerEmail: true,
            disableWallets: ['link'], // Force Apple Pay / Google Pay only
        });

        // Check if digital wallet is available
        pr.canMakePayment().then((result) => {
            if (result) {
                setPaymentRequest(pr);
            }
        });

        pr.on('paymentmethod', async (ev) => {
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
            );

            if (error) {
                ev.complete('fail');
                setMessage(error.message || "Error processing payment");
            } else {
                ev.complete('success');
                if (paymentIntent && paymentIntent.status === "succeeded") {
                    setMessage(t('success'));
                    if (onSuccess) onSuccess();
                }
            }
        });

    }, [stripe, amount, clientSecret, t, onSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            setMessage(t('success'));
            if (onSuccess) onSuccess();
        } else {
            setMessage(t('error_generic'));
        }

        setIsLoading(false);
    };

    return (
        <div className="w-full">
            {view === 'options' ? (
                <div className="space-y-3">
                    {paymentRequest && (
                        <div className="w-full">
                            {/* Stripe's native Apple/Google Pay button */}
                            <PaymentRequestButtonElement options={{ paymentRequest }} className="w-full h-[48px]" />
                        </div>
                    )}

                    <button
                        onClick={() => setView('card')}
                        className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                    >
                        <CreditCard className="w-5 h-5" />
                        <span>{t('pay_card')}</span>
                    </button>
                    {!paymentRequest && (
                        <p className="text-xs text-center text-gray-400 mt-2">
                            {t('apple_pay_unavailable')}
                        </p>
                    )}
                </div>
            ) : (
                <form id="payment-form" onSubmit={handleSubmit} className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
                    <button
                        type="button"
                        onClick={() => setView('options')}
                        className="mb-4 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" /> {t('back')}
                    </button>

                    <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

                    {message && (
                        <div id="payment-message" className="text-red-500 text-sm mt-4 text-center">
                            {message}
                        </div>
                    )}

                    <button
                        disabled={isLoading || !stripe || !elements}
                        id="submit"
                        className="w-full mt-6 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('processing')}
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                {t('pay_button', { amount: (amount / 100).toFixed(2) })}
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
