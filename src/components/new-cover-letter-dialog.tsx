"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getResumes, SavedResume } from "@/lib/actions/resumes";

interface NewCoverLetterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewCoverLetterDialog({ open, onOpenChange }: NewCoverLetterDialogProps) {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);
    const [selectedResume, setSelectedResume] = useState<string | null>(null);
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load resumes when dialog opens
    useEffect(() => {
        if (open) {
            setIsLoading(true);
            getResumes().then((data) => {
                setResumes(data);
                setIsLoading(false);
            });
        }
    }, [open]);

    // Reset state when closing
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setSelectedResume(null);
            }, 300);
        }
    }, [open]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onOpenChange(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onOpenChange]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onOpenChange(false);
        }
    };

    const handleCreateCoverLetter = () => {
        if (selectedResume) {
            onOpenChange(false);
            router.push(`/dashboard/cover-letters/builder?resume=${selectedResume}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
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
                    className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-2xl bg-background rounded-xl shadow-2xl border relative flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-10"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>

                        <div className="flex flex-col space-y-1.5 p-6 pb-2">
                            <h3 className="font-semibold leading-none tracking-tight text-xl">Create New Cover Letter</h3>
                            <p className="text-sm text-muted-foreground">
                                Select a resume to tailor your cover letter.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : resumes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                                    <h4 className="font-semibold mb-2">No resumes found</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Create a resume first to generate a tailored cover letter.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            onOpenChange(false);
                                            router.push("/dashboard/resumes");
                                        }}
                                    >
                                        Create Resume
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {resumes.map((resume) => (
                                        <div
                                            key={resume.id}
                                            onClick={() => setSelectedResume(resume.id)}
                                            className={cn(
                                                "relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent",
                                                selectedResume === resume.id
                                                    ? "border-primary bg-primary/10 dark:bg-primary/20"
                                                    : "border-gray-100 dark:border-gray-800 hover:border-primary/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                                                selectedResume === resume.id
                                                    ? "bg-primary/20 dark:bg-primary/30 text-primary"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                            )}>
                                                <FileText className="w-6 h-6" />
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {resume.name || "Untitled Resume"}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    {(resume.target_company || resume.target_job) && (
                                                        <>
                                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                                {resume.target_company || resume.target_job}
                                                            </span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span>Updated {formatDate(resume.updated_at)}</span>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedResume === resume.id
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-gray-300 dark:border-gray-600"
                                            )}>
                                                {selectedResume === resume.id && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!selectedResume}
                                onClick={handleCreateCoverLetter}
                            >
                                Create Cover Letter
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
