"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (session) {
            // Logged in -> redirect to dashboard
            router.replace("/dashboard");
        } else {
            // Not logged in -> redirect to signup
            router.replace("/auth/signup");
        }
    }, [session, status, router]);

    // Loading state
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
}