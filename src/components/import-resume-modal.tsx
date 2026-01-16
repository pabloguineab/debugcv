"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { extractProfileFromCV, type ExtractedProfile, type ExtractResult, type ImportError } from "@/app/actions/extract-profile-from-cv";

interface ImportResumeModalProps {
    open: boolean;
    onClose: () => void;
    onImportComplete: (data: ExtractedProfile) => Promise<void> | void;
}

type ImportStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function ImportResumeModal({ open, onClose, onImportComplete }: ImportResumeModalProps) {
    const [status, setStatus] = useState<ImportStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        if (!file) return;

        // Validate file type
        const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            setError("Please upload a PDF or DOCX file");
            setStatus("error");
            return;
        }

        setFileName(file.name);
        setStatus("uploading");
        setError(null);

        try {
            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 500));
            setStatus("processing");

            const formData = new FormData();
            formData.append("file", file);

            const result = await extractProfileFromCV(formData);

            if (result.success && result.data) {
                // Process the data first while showing the loader
                await onImportComplete(result.data);
                
                setStatus("success");
                // Short delay to show success state
                await new Promise(resolve => setTimeout(resolve, 2000));
                handleClose();
            } else {
                // Handle specific error types
                setError(result.errorMessage || "Could not extract data from the CV. Please try again.");
                setStatus("error");
            }
        } catch (err) {
            console.error("Import error:", err);
            setError("An error occurred while processing the CV.");
            setStatus("error");
        }
    };

    const handleClose = () => {
        setStatus("idle");
        setError(null);
        setFileName(null);
        onClose();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                    onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-md bg-background rounded-xl shadow-2xl border relative flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-2">
                            <h3 className="flex items-center gap-2 text-lg font-semibold border-none">
                                <FileText className="size-5 text-blue-600" />
                                Import Resume
                            </h3>
                            <button onClick={handleClose} className="p-1 hover:bg-muted rounded-md transition-colors opacity-70 hover:opacity-100">
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="p-6 pt-2">
                            <AnimatePresence mode="wait">
                                {status === "idle" && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleInputChange}
                                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                className="hidden"
                                            />
                                            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                                <Upload className="size-6 text-blue-600" />
                                            </div>
                                            <p className="text-sm font-medium mb-1">
                                                <span className="text-blue-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PDF or DOCX (max 10MB)
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-4 text-center">
                                            We&apos;ll use AI to extract your profile information from your resume.
                                        </p>
                                    </motion.div>
                                )}

                                {(status === "uploading" || status === "processing") && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8 text-center"
                                    >
                                        <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                            <Loader2 className="size-8 text-blue-600 animate-spin" />
                                        </div>
                                        <p className="text-sm font-medium mb-1">
                                            {status === "uploading" ? "Uploading..." : "Extracting profile data..."}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {fileName}
                                        </p>
                                        {status === "processing" && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                This may take a few seconds
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {status === "success" && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8 text-center"
                                    >
                                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                            <CheckCircle2 className="size-8 text-green-600" />
                                        </div>
                                        <p className="text-sm font-medium text-green-600">
                                            Profile data extracted successfully!
                                        </p>
                                    </motion.div>
                                )}

                                {status === "error" && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8 text-center"
                                    >
                                        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                            <AlertCircle className="size-8 text-red-600" />
                                        </div>
                                        <p className="text-sm font-medium text-red-600 mb-2">
                                            Import failed
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            {error}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setStatus("idle");
                                                setError(null);
                                            }}
                                        >
                                            Try again
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
