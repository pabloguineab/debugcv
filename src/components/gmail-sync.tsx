"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface Application {
    id: string;
    title: string;
    company: string;
    location: string | null;
    jobUrl: string | null;
    appliedDate: string;
    status: "applied";
}

interface GmailSyncProps {
    onApplicationsImported?: (applications: Application[]) => void;
}

export function GmailSync({ onApplicationsImported }: GmailSyncProps) {
    const { data: session } = useSession();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = (session?.user as any)?.provider;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleAccessToken = (session?.user as any)?.googleAccessToken;

    const isConnected = provider === 'google' || !!googleAccessToken;

    const handleConnectGoogle = () => {
        const userEmail = session?.user?.email;
        signIn('google', {
            callbackUrl: '/dashboard/application-board',
            ...(userEmail && { login_hint: userEmail })
        });
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncStatus('idle');

        try {
            const response = await fetch('/api/gmail/sync', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.status === 401 && data.requiresConnect) {
                setSyncStatus('error');
                setMessage('Permission required. Please reconnect Google.');
                return;
            }

            if (response.ok) {
                setSyncStatus('success');
                setMessage(`✅ ${data.message}`);

                // Callback with imported applications
                if (onApplicationsImported && data.applications) {
                    onApplicationsImported(data.applications);
                }

                setTimeout(() => {
                    setSyncStatus('idle');
                    setMessage('');
                }, 3000);
            } else {
                throw new Error(data.error || 'Sync failed');
            }
        } catch (error) {
            console.error('Gmail sync error:', error);
            setSyncStatus('error');
            if (message !== 'Permission required. Please reconnect Google.') {
                setMessage('❌ Failed to sync. Please try again.');
            }
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isConnected) {
        return (
            <Button
                onClick={handleConnectGoogle}
                variant="outline"
                size="sm"
                className="gap-1 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
            >
                <Mail className="w-3 h-3" />
                Connect Now
            </Button>
        );
    }

    if (message.includes('Permission required')) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-red-500 text-xs">Permission missing</span>
                <Button
                    onClick={handleConnectGoogle}
                    variant="outline"
                    size="sm"
                    className="gap-1 border-red-200 hover:bg-red-100 dark:border-red-800"
                >
                    <Mail className="w-3 h-3" />
                    Give Access
                </Button>
            </div>
        );
    }

    // ... rest of render logic ...

    if (syncStatus === 'success') {
        return (
            <div className="flex items-center gap-2 text-green-600 text-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>{message}</span>
            </div>
        );
    }

    if (syncStatus === 'error') {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{message}</span>
                </div>
                <Button
                    onClick={handleSync}
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7 text-xs border-red-200 hover:bg-red-100"
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="gap-1 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
        >
            {isSyncing ? (
                <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Scanning...
                </>
            ) : (
                <>
                    <Mail className="w-3 h-3" />
                    Sync Now
                </>
            )}
        </Button>
    );
}
