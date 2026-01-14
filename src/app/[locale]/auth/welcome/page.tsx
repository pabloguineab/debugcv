"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { WelcomePreloader } from "@/components/welcome-preloader";

function WelcomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [userName, setUserName] = useState("");

    // Get name from session or searchParams
    useEffect(() => {
        const nameFromParams = searchParams.get("name");
        const nameFromSession = session?.user?.name;
        setUserName(nameFromParams || nameFromSession || "");
    }, [session, searchParams]);

    const handleComplete = () => {
        router.push("/dashboard");
    };

    if (!userName) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return <WelcomePreloader userName={userName} onComplete={handleComplete} duration={2500} />;
}

export default function WelcomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            <WelcomeContent />
        </Suspense>
    );
}
