"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Loader2, Copy, Check, X } from "lucide-react";
import confetti from "canvas-confetti";

// Form schema
const formSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
});

type FormData = z.infer<typeof formSchema>;

interface ReferFriendModalProps {
    open: boolean;
    onClose: () => void;
}

export function ReferFriendModal({
    open,
    onClose,
}: ReferFriendModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const { control, handleSubmit, reset, formState: { isSubmitting } } = form;

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    // Reset state when opening/closing
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setIsSuccess(false);
                reset();
            }, 300);
        }
    }, [open, reset]);

    const fireConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const onSubmit = async (data: FormData) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        fireConfetti();
        setIsSuccess(true);

        // Auto close after success animation
        setTimeout(() => {
            onClose();
        }, 3000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText("https://debugcv.com/invite/pablo");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-y-0 right-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-md bg-background rounded-lg shadow-lg border grid gap-4 relative"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                        {!isSuccess ? (
                            <>
                                <div className="flex flex-col space-y-1.5 p-6 pb-0">
                                    <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2 text-lg">
                                        <Gift className="w-5 h-5 text-green-600" /> Refer a Friend
                                    </h3>
                                    <p className="text-sm text-muted-foreground pt-1">
                                        Invite your friends to DebugCV and you'll both get <span className="font-medium text-foreground">30% off</span>.
                                    </p>
                                </div>

                                <div className="p-6 pt-0 grid gap-4">
                                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">

                                        <div className="grid gap-2">
                                            <Label htmlFor="link" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Your Referral Link
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Label htmlFor="link" className="sr-only">
                                                        Link
                                                    </Label>
                                                    <Input
                                                        id="link"
                                                        defaultValue="https://debugcv.com/invite/pablo"
                                                        readOnly
                                                        className="h-9 bg-muted/50"
                                                    />
                                                </div>
                                                <Button type="button" size="sm" className="px-3" variant="outline" onClick={handleCopyLink}>
                                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-background px-2 text-muted-foreground">
                                                    Or send via email
                                                </span>
                                            </div>
                                        </div>

                                        <Controller
                                            name="email"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Friend's Email</Label>
                                                    <Input
                                                        {...field}
                                                        id="email"
                                                        placeholder="friend@example.com"
                                                        autoComplete="off"
                                                    />
                                                    {fieldState.error && (
                                                        <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button variant="outline" type="button" onClick={onClose}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <>Send Invite</>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">Invitation Sent!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We've sent an email to your friend.
                                    </p>
                                </div>
                                <Button className="mt-4" variant="outline" onClick={onClose}>
                                    Done
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
