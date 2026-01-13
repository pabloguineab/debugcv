"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Linkedin, Eye, EyeOff } from "lucide-react"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    buttonText?: string
    isSignup?: boolean
}

export function UserAuthForm({ className, buttonText = "Sign In", isSignup = false, ...props }: UserAuthFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)
    const [showPassword, setShowPassword] = React.useState(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const target = event.target as typeof event.target & {
            email: { value: string };
            password?: { value: string };
        };
        const email = target.email.value;
        const password = target.password?.value;

        try {
            if (isSignup) {
                // SIGNUP: Send OTP and redirect to verify page
                const res = await fetch("/api/auth/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, isSignup: true }),
                });

                const data = await res.json();

                if (!res.ok) {
                    if (data.error === "USER_EXISTS") {
                        setError("USER_EXISTS");
                    } else {
                        setError(data.message || "Failed to send verification code");
                    }
                    setIsLoading(false);
                    return;
                }

                router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
            } else {
                // SIGNIN: Use email + password
                if (!password) {
                    setError("Please enter your password");
                    setIsLoading(false);
                    return;
                }

                const result = await signIn("email-password", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError("Invalid email or password");
                    setIsLoading(false);
                    return;
                }

                if (result?.ok) {
                    window.location.href = "/dashboard";
                }
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {!isSignup && (
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-[11px] text-gray-400 hover:text-gray-500 hover:underline underline-offset-4"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <Button disabled={isLoading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                        {isLoading && (
                            <svg
                                className="mr-2 h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        )}
                        {buttonText}
                    </Button>
                </div>
            </form>

            {error === "USER_EXISTS" && (
                <div className="text-sm text-center p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-200">
                        This email is already registered.{" "}
                        <Link href="/auth/signin" className="font-medium underline hover:text-amber-900">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            )}

            {error && error !== "USER_EXISTS" && (
                <div className="text-[11px] text-center text-gray-400 -mt-1">{error}</div>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid gap-2">
                <Button variant="outline" type="button" disabled={isLoading} onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </Button>
                <Button variant="outline" type="button" disabled={isLoading} onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}>
                    <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" />
                    LinkedIn
                </Button>
                <Button variant="outline" type="button" disabled={isLoading} onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                </Button>
            </div>
        </div>
    )
}
