
"use client";

import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Crown, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface LimitModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpgrade: () => void;
    feature: string;
}

export function LimitModal({ open, onOpenChange, onUpgrade, feature }: LimitModalProps) {
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-muted/10 border-blue-200 dark:border-blue-900 shadow-xl">
                <DialogHeader className="flex flex-col items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-4 rounded-full mb-2 animate-bounce-slow">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">Pro Feature Limit</Badge>
                    <DialogTitle className="text-center text-2xl font-bold tracking-tight">Unlock Unlimited Access</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground max-w-sm">
                        You've reached the free limit for <strong>{feature}</strong>. Upgrade to Pro to remove all limits and unlock premium features.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
                            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>Unlimited Downloads</span>
                        </div>
                        <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
                            <Crown className="w-4 h-4 text-purple-500 fill-purple-500" />
                            <span>Unlimited Scans</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2 mt-2 w-full">
                    <Button onClick={onUpgrade} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border-0 h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" size="lg">
                        <Zap className="w-5 h-5 fill-white/20" /> Upgrade to Pro
                    </Button>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground hover:bg-transparent hover:text-foreground">
                        Maybe later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
