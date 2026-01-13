import { Metadata } from "next"
import { Link } from '@/i18n/routing'
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"
import { UserAuthForm } from "../components/user-auth-form"
import { Logo } from "@/components/Logo"
import { AuthSidePanel } from "@/components/auth-side-panel"

export const metadata: Metadata = {
    title: "Create an account",
    description: "Create an account to get started.",
}

export default function SignUpPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/auth/signin"
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "absolute right-4 top-4 md:right-8 md:top-8"
                )}
            >
                Login
            </Link>

            {/* Panel Izquierdo: Nuevo AuthSidePanel */}
            <div className="relative hidden h-full flex-col bg-white lg:flex dark:border-r">
                <AuthSidePanel />
            </div>

            {/* Panel Derecho: Formulario */}
            <div className="p-8 lg:p-8 flex items-center justify-center h-full">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>
                    <UserAuthForm buttonText="Sign Up with Email" isSignup={true} />
                    <p className="px-8 text-center text-[11px] text-gray-400">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-gray-500"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-gray-500"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
