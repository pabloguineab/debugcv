
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Check, Zap, Download, FileText, BarChart, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { UpgradePlanModal } from "@/components/upgrade-plan-modal";

export default function BillingPage() {
    const { data: session, status } = useSession();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/auth/signin");
        }
    }, [status]);

    useEffect(() => {
        if (session) {
            fetch("/api/usage")
                .then(res => res.json())
                .then(data => {
                    setData(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [session]);

    if (status === "loading" || loading) {
        return <div className="p-10 text-center text-sm text-muted-foreground">Loading billing details...</div>;
    }

    if (!session) {
        return null;
    }

    const { isPro, usage, limits } = data || { isPro: false, usage: {}, limits: {} };

    // Helper to calculate progress
    const getProgress = (current: number, max: number) => {
        if (max === null || max === undefined || max === Infinity) return 0;
        return Math.min((current / max) * 100, 100);
    };

    const renderLimit = (label: string, icon: any, current: number, max: number) => (
        <div className="space-y-3">
            <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-2">{icon} {label}</span>
                <span className="text-muted-foreground font-mono text-xs">
                    {max === null || max === undefined || max === Infinity || max > 1000 ? `${current} / Unlimited` : `${current} / ${max}`}
                </span>
            </div>
            <Progress value={getProgress(current, max)} className="h-2" />
        </div>
    );

    return (
        <div className="space-y-6 w-full py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight">Billing & Plans</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage your subscription and payment details.</p>
                </div>
                {!isPro && (
                    <Button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        Upgrade Plan
                    </Button>
                )}
            </div>

            <Separator />

            {/* Current Plan & Usage */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Card */}
                <Card className={`bg-blue-50/30 dark:bg-blue-950/20 shadow-sm relative overflow-hidden flex flex-col ${isPro ? "border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/20" : "border-blue-200 dark:border-blue-900"}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Zap className={`w-32 h-32 fill-current ${isPro ? "text-purple-500" : "text-blue-500"}`} />
                    </div>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className={isPro ? "text-purple-700 dark:text-purple-400" : "text-blue-700 dark:text-blue-400"}>
                                    {isPro ? "Pro Plan" : "Free Plan"}
                                </CardTitle>
                                <CardDescription>{isPro ? "Unlimited access to all features." : "Perfect for getting started."}</CardDescription>
                            </div>
                            <Badge variant="outline" className={isPro ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"}>Current</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 relative z-10">
                        <div className="text-3xl font-bold">{isPro ? "$19" : "$0"}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2 items-center">
                                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                {isPro ? "Unlimited AI Scans" : "3 AI Resume Scans / month"}
                            </li>
                            <li className="flex gap-2 items-center">
                                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                {isPro ? "Unlimited Resumes & Cover Letters" : "3 Resumes & 3 Cover Letters"}
                            </li>
                            <li className="flex gap-2 items-center">
                                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                {isPro ? "Unlimited Downloads" : "Limited Downloads (1/mo)"}
                            </li>
                            <li className="flex gap-2 items-center">
                                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                {isPro ? "Enhanced Job Search" : "Standard Job Search"}
                            </li>
                        </ul>
                    </CardContent>
                    {!isPro && (
                        <CardFooter className="pt-0">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                onClick={() => setIsUpgradeModalOpen(true)}
                            >
                                Upgrade to Pro
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Usage Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-primary" />
                            Usage Limits
                        </CardTitle>
                        <CardDescription>Your monthly usage for current billing cycle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-y-auto max-h-[400px]">
                        {renderLimit("Resumes Created", <FileText className="w-4 h-4 text-muted-foreground" />, usage.resumes || 0, limits.RESUMES)}
                        {renderLimit("Cover Letters Created", <PenTool className="w-4 h-4 text-muted-foreground" />, usage.coverLetters || 0, limits.COVER_LETTERS)}

                        <Separator />

                        {renderLimit("Resume Downloads (Monthly)", <Download className="w-4 h-4 text-muted-foreground" />, usage.resumeDownloads || 0, limits.RESUME_DOWNLOADS)}
                        {renderLimit("Cover Letter Downloads (Monthly)", <Download className="w-4 h-4 text-muted-foreground" />, usage.coverLetterDownloads || 0, limits.COVER_LETTER_DOWNLOADS)}
                        {renderLimit("ATS Scans (Monthly)", <BarChart className="w-4 h-4 text-muted-foreground" />, usage.atsScans || 0, limits.ATS_SCANS)}

                        {!isPro && usage.periodStart && (
                            <p className="text-xs text-muted-foreground pt-2">
                                Limits reset on {new Date(new Date(usage.periodStart).setMonth(new Date(usage.periodStart).getMonth() + 1)).toLocaleDateString()}.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment Method */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Payment Method
                    </CardTitle>
                    <CardDescription>Manage your payment details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-muted p-2 rounded border">
                                <CreditCard className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                No payment method added.
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Add Method</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>View and download past invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-dashed p-8 text-center bg-muted/10">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                        <h3 className="text-sm font-medium mb-1">No invoices yet</h3>
                        <p className="text-xs text-muted-foreground">Invoices will appear here once you make a payment.</p>
                    </div>
                </CardContent>
            </Card>

            <UpgradePlanModal
                open={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentPlan={isPro ? "Pro" : "Free"}
            />
        </div>
    );
}
