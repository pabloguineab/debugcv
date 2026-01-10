"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Wait for session to load

        if (!session) {
            // Not logged in -> redirect to signup
            router.replace("/auth/signup");
        }
    }, [session, status, router]);

    // Loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Not logged in (will redirect)
    if (!session) {
        return null;
    }

    // Logged in -> Show welcome page
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center p-8">
                <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {session.user?.name?.charAt(0) || "U"}
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome back!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    {session.user?.name || session.user?.email}
                </p>
                <p className="text-gray-500">
                    Dashboard coming soon...
                </p>
            </div>
        </div>
    );
}