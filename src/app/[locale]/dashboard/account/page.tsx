"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Check, X, AlertTriangle, Key, Trash2, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function AccountPage() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/auth/signin");
        }
    }, [status]);

    if (status === "loading") {
        return <div className="p-10 text-center text-sm text-muted-foreground">Loading account...</div>;
    }

    if (!session?.user) {
        return null;
    }

    const userData = session.user as any;
    const provider = userData.provider || "email";

    // Determine provider status
    const isGoogle = provider === "google";
    const isLinkedIn = provider === "linkedin";
    const isGitHub = provider === "github";
    const isEmail = provider === "email" || provider === "credentials" || provider === "email-password";

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div>
                <h3 className="text-2xl font-semibold tracking-tight">Account</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            </div>

            <Separator />

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Your personal information and how we contact you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <div className="flex gap-2">
                                    <Input id="name" defaultValue={userData.name || ""} disabled className="bg-muted" />
                                    <Button variant="outline" size="icon" disabled>
                                        <Key className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">This is your public display name.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="flex gap-2">
                                    <Input id="email" defaultValue={userData.email || ""} disabled className="bg-muted" />
                                    <Button variant="outline" size="icon" disabled>
                                        <Mail className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Used for sign in and notifications.</p>
                            </div>
                        </div>
                        <div className="md:w-1/3 flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/20">
                            <div className="relative w-24 h-24 mb-4">
                                <Image
                                    src={userData.image || "/placeholder-user.jpg"}
                                    alt="Profile"
                                    fill
                                    className="rounded-full object-cover border-2 border-background shadow-sm"
                                />
                            </div>
                            <Link
                                href="/dashboard/profile"
                                className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                                Change Avatar
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security / Connected Accounts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Security & Connections
                    </CardTitle>
                    <CardDescription>Manage how you sign in to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google */}
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-full border shadow-sm">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium">Google</p>
                                <p className="text-xs text-muted-foreground">Sign in with Google</p>
                            </div>
                        </div>
                        {isGoogle ? (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50 flex gap-1">
                                <Check className="w-3 h-3" /> Connected
                            </Badge>
                        ) : (
                            <Button variant="outline" size="sm" disabled>Connect</Button>
                        )}
                    </div>

                    {/* LinkedIn - Placeholder if not used */}
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="bg-[#0077b5] p-2 rounded-full border shadow-sm">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium">LinkedIn</p>
                                <p className="text-xs text-muted-foreground">Sign in with LinkedIn</p>
                            </div>
                        </div>
                        {isLinkedIn ? (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50 flex gap-1">
                                <Check className="w-3 h-3" /> Connected
                            </Badge>
                        ) : (
                            <Button variant="outline" size="sm" disabled>Connect</Button>
                        )}
                    </div>

                    {/* Email/Password */}
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full border shadow-sm">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Email & Password</p>
                                <p className="text-xs text-muted-foreground">Sign in with email and password</p>
                            </div>
                        </div>
                        {isEmail ? (
                            <div className="flex gap-2">
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 flex gap-1">
                                    <Check className="w-3 h-3" /> Active
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-6 text-xs">Change Password</Button>
                            </div>
                        ) : (
                            <Badge variant="secondary" className="text-xs">Not used</Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900 overflow-hidden">
                <CardHeader className="bg-red-50/50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/50">
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-600/80 dark:text-red-400/80">Irreversible account actions.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Delete Account</p>
                            <p className="text-xs text-muted-foreground">Permanently remove your Personal Account and all of its contents from the DebugCV platform. This action is not reversible, so please continue with caution.</p>
                        </div>
                        <Button variant="destructive" size="sm" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
