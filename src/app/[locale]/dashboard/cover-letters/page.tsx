"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, Trash2 } from "lucide-react";
import { Book } from "@/components/ui/book";
import { NewCoverLetterDialog } from "@/components/new-cover-letter-dialog";
import { getCoverLetters, deleteCoverLetter, SavedCoverLetter } from "@/lib/actions/cover-letters";
import { Button } from "@/components/ui/button";

export default function CoverLettersPage() {
    const router = useRouter();
    const [isNewCoverLetterDialogOpen, setIsNewCoverLetterDialogOpen] = useState(false);
    const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cover letters
    useEffect(() => {
        const loadCoverLetters = async () => {
            setIsLoading(true);
            try {
                const data = await getCoverLetters();
                setCoverLetters(data);
            } catch (error) {
                console.error("Error loading cover letters:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCoverLetters();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this cover letter?")) {
            const result = await deleteCoverLetter(id);
            if (result.success) {
                setCoverLetters(prev => prev.filter(cl => cl.id !== id));
            }
        }
    };

    const handleOpenCoverLetter = (id: string) => {
        router.push(`/dashboard/cover-letters/builder?id=${id}`);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
                        <Mail className="w-6 h-6 text-blue-600" />
                        Cover Letters
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create tailored cover letters for every application
                    </p>
                </div>
            </div>

            {/* Cover Letters List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {/* Existing cover letters */}
                    {coverLetters.map((coverLetter) => (
                        <div key={coverLetter.id} className="relative group">
                            <div onClick={() => handleOpenCoverLetter(coverLetter.id)}>
                                <Book
                                    title={coverLetter.target_job || "Cover Letter"}
                                    subtitle="Cover Letter"
                                    target={coverLetter.target_company}
                                    width={180}
                                    height={260}
                                    variant="cover-letter"
                                />
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                                onClick={(e) => handleDelete(coverLetter.id, e)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    {/* Add New placeholder */}
                    <div
                        onClick={() => setIsNewCoverLetterDialogOpen(true)}
                        className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                        style={{ width: 180, height: 260 }}
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">New Cover Letter</span>
                    </div>
                </div>
            )}

            <NewCoverLetterDialog
                open={isNewCoverLetterDialogOpen}
                onOpenChange={setIsNewCoverLetterDialogOpen}
            />
        </div>
    );
}
