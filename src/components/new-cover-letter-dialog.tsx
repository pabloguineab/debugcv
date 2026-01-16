"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewCoverLetterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MOCK_RESUMES = [
    { id: "1", title: "Software Engineer", target: "Google", date: "Last edited 2 days ago" },
    { id: "2", title: "Frontend Lead", target: "Meta", date: "Last edited 5 days ago" }
];

export function NewCoverLetterDialog({ open, onOpenChange }: NewCoverLetterDialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [selectedResume, setSelectedResume] = useState<string | null>(null);

    // Reset state when opening/closing
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
                                Select a base resume to tailor your cover letter.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="grid gap-4">
                                {MOCK_RESUMES.map((resume) => (
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
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{resume.title}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Target: {resume.target}</span>
                                                <span>•</span>
                                                <span>{resume.date}</span>
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
                        </div>

                        <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button disabled={!selectedResume}>
                                Create This Cover Letter
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
