"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { signIn } from "next-auth/react";

function VerifyPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") || "your email";

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
        if (code.length === 6) {
            setIsLoading(true);
            try {
                // Use NextAuth signIn to verify OTP and create session
                const result = await signIn("otp", {
                    email,
                    code,
                    redirect: false,
                    callbackUrl: "/dashboard"
                });

                if (result?.ok) {
                    router.push("/dashboard");
                } else {
                    console.error("Verification failed", result?.error);
                    // Handle error (shake animation, toast, etc.)
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleResend = async () => {
        setCanResend(false);
        setTimer(60);
        // Trigger resend API
        await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
    };

    const openEmailApp = (provider: string) => {
        let url = "";
        const domain = email.split("@")[1];

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
            case "aol":
                url = "https://mail.aol.com/";
                break;
            default:
                url = `https://${domain}`;
        }
        window.open(url, "_blank");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center space-y-6">

                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Check your email</h1>
                    <p className="text-muted-foreground">
                        We sent a 6-digit code to <span className="font-medium text-slate-900 dark:text-slate-200">{email}</span>.
                    </p>
                </div>

                <div className="flex justify-center py-4">
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={handleVerify}
                        disabled={isLoading}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="h-14 w-10 sm:h-16 sm:w-12 text-2xl border-slate-200 dark:border-slate-800" />
                            <InputOTPSlot index={1} className="h-14 w-10 sm:h-16 sm:w-12 text-2xl border-slate-200 dark:border-slate-800" />
                            <InputOTPSlot index={2} className="h-14 w-10 sm:h-16 sm:w-12 text-2xl border-slate-200 dark:border-slate-800" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="h-14 w-10 sm:h-16 sm:w-12 text-2xl border-slate-200 dark:border-slate-800" />
                            <InputOTPSlot index={4} className="h-14 w-10 sm:h-16 sm:w-12 text-2xl border-slate-200 dark:border-slate-800" />
                            <InputOTPSlot index={5} className="h-14 w-10 sm:h-16 sm:w-12 text-2xl border-slate-200 dark:border-slate-800" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="text-sm text-slate-500">
                    Didn't receive OTP?{" "}
                    {!canResend ? (
                        <span>Wait <span className="font-medium text-slate-900 dark:text-slate-300">{timer}s</span></span>
                    ) : (
                        <button onClick={handleResend} className="text-blue-600 hover:underline font-medium">Resend code</button>
                    )}
                    {" "}or{" "}
                    <Link href="/auth/signin" className="text-blue-600 hover:underline font-medium">Change email</Link>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-left flex gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">Your privacy is important</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            We may send you job suggestions, reminders and recruiter messages from us and our partners. You can tailor the emails you receive in settings.
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-4">Access your inbox with:</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-12 justify-start gap-3 bg-white dark:bg-slate-950" onClick={() => openEmailApp("gmail")}>
                            {/* Simple Gmail Icon SVG */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" /></svg>
                            Gmail
                        </Button>
                        <Button variant="outline" className="h-12 justify-start gap-3 bg-white dark:bg-slate-950" onClick={() => openEmailApp("outlook")}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.636 5.455v13.09c0 .905.733 1.637 1.637 1.637h20.727V9.818L10.91 0 1.636 5.455zM24 16.91V6.545L12 13.636l12 3.273z" fill="#0072C6" /><path d="M22.364 4.364h-9.818L1.636 9.818v9.818h20.728c.904 0 1.636-.732 1.636-1.636V4.364z" fill="#0072C6" opacity=".2" /></svg>
                            Outlook
                        </Button>
                        <Button variant="outline" className="h-12 justify-start gap-3 bg-white dark:bg-slate-950" onClick={() => openEmailApp("yahoo")}>
                            <div className="w-5 h-5 bg-[#6001D2] rounded text-[10px] flex items-center justify-center text-white font-bold">Y!</div>
                            Yahoo
                        </Button>
                        <Button variant="outline" className="h-12 justify-start gap-3 bg-white dark:bg-slate-950" onClick={() => openEmailApp("default")}>
                            <Mail className="w-5 h-5 text-slate-600" />
                            Other
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyPageContent />
        </Suspense>
    );
}
