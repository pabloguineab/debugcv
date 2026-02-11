
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Check, Zap, Download, FileText, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { redirect } from "next/navigation";

export default async function BillingPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    // Mock data for free plan
    const usage = {
        scanCredits: 3, // 3/10
        activeApplications: 12, // 12/unlimited
        aiInterviews: 1, // 1/5
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight">Billing & Plans</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage your subscription and payment details.</p>
                </div>
                <Button asChild>
                    <Link href="/pricing" className="flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-current" />
                        Upgrade Plan
                    </Link>
                </Button>
            </div>

            <Separator />

            {/* Current Plan & Usage */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Card */}
                <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-900 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Zap className="w-32 h-32 text-blue-500 fill-current" />
                    </div>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-blue-700 dark:text-blue-400">Free Plan</CardTitle>
                                <CardDescription>Perfect for getting started.</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Current</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 relative z-10">
                        <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2 items-center">
                                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                5 AI Resume Scans / month
                            </li>
                            <li className="flex gap-2 items-center">
                                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                Basic Job Tracking
                            </li>
                            <li className="flex gap-2 items-center">
                                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                Community Support
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">Upgrade to Pro</Button>
                    </CardFooter>
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
                    <CardContent className="space-y-8 flex-1">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> AI Resume Scans</span>
                                <span className="text-muted-foreground font-mono text-xs">{usage.scanCredits} / 5</span>
                            </div>
                            <Progress value={(usage.scanCredits / 5) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground">Credits reset in 14 days</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-muted-foreground" /> AI Interview Sessions</span>
                                <span className="text-muted-foreground font-mono text-xs">{usage.aiInterviews} / 2</span>
                            </div>
                            <Progress value={(usage.aiInterviews / 2) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground">Sessions reset in 14 days</p>
                        </div>
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
                        <p className="text-xs text-muted-foreground">Invoices will appear here once you upgrade your plan.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
