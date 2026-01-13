"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadResumeModalProps {
    open: boolean;
    onClose: () => void;
}

export function UploadResumeModal({
    open,
    onClose,
}: UploadResumeModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state when opening/closing
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setFile(null);
                setError(null);
                setTermsAccepted(false);
                setIsUploading(false);
                setIsSuccess(false);
            }, 300);
        }
    }, [open]);

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

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File) => {
        if (file.type !== "application/pdf") {
            setError("Only PDF files are allowed.");
            return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError("File size must be less than 5MB.");
            return false;
        }
        return true;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setError(null);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsUploading(false);
        setIsSuccess(true);

        // Auto close after success? Or let user close.
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const removeFile = () => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
                        className="w-full max-w-lg bg-background rounded-lg shadow-lg border grid gap-6 p-6 relative"
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

                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2 text-xl">
                                Get Expert Review
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Upload your CV to get professional feedback and actionable insights from an expert recruiter.
                            </p>
                        </div>

                        {!isSuccess ? (
                            <div className="grid gap-6">
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer gap-4",
                                        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                                        file ? "border-primary/50 bg-primary/5" : "",
                                        error ? "border-destructive/50 bg-destructive/5" : ""
                                    )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !file && fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileSelect}
                                    />

                                    {file ? (
                                        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile();
                                                }}
                                            >
                                                Change File
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-1">
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">Click to upload or drag and drop</p>
                                                <p className="text-xs text-muted-foreground">PDF (max. 5MB)</p>
                                            </div>
                                        </>

                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 px-1">
                                    <Checkbox
                                        id="terms"
                                        checked={termsAccepted}
                                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="terms"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Accept terms and conditions
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            By clicking this checkbox, you agree to the terms and conditions.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={onClose} disabled={isUploading}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpload} disabled={!file || !termsAccepted || isUploading}>
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Resume"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="font-semibold text-lg">Upload Complete!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your resume has been successfully uploaded and is being processed.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
