"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/ui/book";
import { Trash2, Loader2 } from "lucide-react";
import { deleteResumeAction, SavedResume } from "@/lib/actions/resumes";

interface ResumesListProps {
    initialResumes: SavedResume[];
}

export function ResumesList({ initialResumes }: ResumesListProps) {
    const [resumes, setResumes] = useState<SavedResume[]>(initialResumes);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleOpenResume = (resume: SavedResume) => {
        router.push(`/dashboard/resumes/builder?id=${resume.id}`);
    };

    const handleDeleteResume = async (id: string) => {
        setIsDeleting(true);
        try {
            const result = await deleteResumeAction(id);
            if (result.success) {
                setResumes(resumes.filter(r => r.id !== id));
            } else {
                console.error("Failed to delete resume:", result.error);
            }
        } catch (error) {
            console.error("Failed to delete resume:", error);
        } finally {
            setIsDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-4">
                {/* Saved Resumes */}
                {resumes.map((resume) => (
                    <div key={resume.id} className="relative group">
                        <div onClick={() => handleOpenResume(resume)} className="cursor-pointer">
                            <Book
                                title={resume.name || "Untitled Resume"}
                                subtitle="Resume"
                                target={resume.target_company || resume.target_job || "General"}
                                width={180}
                                height={260}
                                previewData={resume.data}
                                lastUpdated={new Date(resume.updated_at).toLocaleDateString()}
                            />
                        </div>
                        {/* Delete button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(resume.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete resume"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteConfirmId && (
                <div 
                    className="fixed inset-y-0 right-0 z-50 bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center left-0 md:left-[255px]"
                    onClick={() => !isDeleting && setDeleteConfirmId(null)}
                >
                    <div 
                        className="bg-background border rounded-lg shadow-xl max-w-[400px] w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Delete Resume?</h3>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone. This will permanently delete your resume.
                            </p>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteConfirmId && handleDeleteResume(deleteConfirmId)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-600/90 h-10 px-4 py-2 min-w-[90px]"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
