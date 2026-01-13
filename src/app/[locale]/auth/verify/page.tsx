"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

function VerifyPageContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleVerify = async (code: string) => {
        setOtp(code);
        setError(null);
        if (code.length === 6) {
            setIsLoading(true);
            try {
                const result = await signIn("otp", {
                    email,
                    code,
                    redirect: false,
                });

                if (result?.error) {
                    setError("Invalid code. Please try again.");
                    setOtp("");
                } else if (result?.ok) {
                    window.location.href = `/auth/onboarding?email=${encodeURIComponent(email)}`;
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleResend = async () => {
        setCanResend(false);
        setTimer(60);
        await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
    };

    const openEmailApp = (provider: string) => {
        let url = "";
        switch (provider) {
            case "gmail":
                url = "https://mail.google.com/";
                break;
            case "outlook":
                url = "https://outlook.live.com/mail/";
                break;
            case "yahoo":
                url = "https://mail.yahoo.com/";
                break;
            default:
                url = `https://mail.${email.split("@")[1]}`;
        }
        window.open(url, "_blank");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-md text-center space-y-6">

                {/* Icon */}
                <div className="mx-auto w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-violet-600" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Check your email</h1>
                    <p className="text-sm text-gray-500">
                        We sent a 6-digit code to <span className="font-medium text-slate-900">{email}</span>.
                    </p>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center py-2">
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={handleVerify}
                        disabled={isLoading}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="h-14 w-12 text-xl rounded-lg border border-gray-200 focus-within:border-blue-500" />
                            <InputOTPSlot index={1} className="h-14 w-12 text-xl rounded-lg border border-gray-200" />
                            <InputOTPSlot index={2} className="h-14 w-12 text-xl rounded-lg border border-gray-200" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="h-14 w-12 text-xl rounded-lg border border-gray-200" />
                            <InputOTPSlot index={4} className="h-14 w-12 text-xl rounded-lg border border-gray-200" />
                            <InputOTPSlot index={5} className="h-14 w-12 text-xl rounded-lg border border-gray-200" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                {/* Resend / Change email */}
                <div className="text-sm text-gray-500">
                    Didn't receive OTP?{" "}
                    <Link href="/auth/signup" className="text-blue-600 hover:underline">Change email</Link>
                    {" "}or{" "}
                    {!canResend ? (
                        <span>wait <span className="font-medium text-slate-900">{timer}s</span>.</span>
                    ) : (
                        <button onClick={handleResend} className="text-blue-600 hover:underline">Resend code</button>
                    )}
                </div>

                {/* Privacy notice */}
                <div className="rounded-xl border border-gray-200 p-4 text-left flex gap-3 bg-gray-50">
                    <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">Your privacy is important</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            We may send you job suggestions, reminders and recruiter messages from us and our partners. You can tailor the emails you receive in settings.
                        </p>
                    </div>
                </div>

                {/* Access inbox buttons */}
                <div className="pt-2">
                    <p className="text-sm font-medium text-slate-900 mb-4">Access your inbox with:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => openEmailApp("gmail")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                                alt="Gmail"
                                className="w-5 h-5"
                            />
                            <span className="text-sm font-medium text-slate-700">Gmail</span>
                        </button>
                        <button
                            onClick={() => openEmailApp("outlook")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Microsoft_Office_Outlook_%282018%E2%80%932024%29.svg/512px-Microsoft_Office_Outlook_%282018%E2%80%932024%29.svg.png"
                                alt="Outlook"
                                className="w-5 h-5"
                            />
                            <span className="text-sm font-medium text-slate-700">Outlook</span>
                        </button>
                        <button
                            onClick={() => openEmailApp("yahoo")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-5 h-5 bg-[#6001D2] rounded text-[10px] flex items-center justify-center text-white font-bold">Y!</div>
                            <span className="text-sm font-medium text-slate-700">Yahoo</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
            <VerifyPageContent />
        </Suspense>
    );
}
