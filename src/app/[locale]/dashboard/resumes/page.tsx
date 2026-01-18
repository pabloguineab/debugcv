"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/ui/book";
import { FileText, Trash2 } from "lucide-react";
import { NewResumeDialog } from "@/components/new-resume-dialog";
import { getResumes, deleteResume, SavedResume } from "@/lib/resume-service";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ResumesPage() {
    const [isNewResumeDialogOpen, setIsNewResumeDialogOpen] = useState(false);
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const router = useRouter();

    // Load resumes from localStorage
    useEffect(() => {
        setResumes(getResumes());
    }, []);

    const handleOpenResume = (resume: SavedResume) => {
        router.push(`/dashboard/resumes/builder?id=${resume.id}`);
    };

    const handleDeleteResume = (id: string) => {
        deleteResume(id);
        setResumes(getResumes());
        setDeleteConfirmId(null);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
                        <FileText className="w-6 h-6 text-blue-600" />
                        CV Builder
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your resumes and create tailored versions for different job applications
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                {/* Saved Resumes */}
                {resumes.map((resume) => (
                    <div key={resume.id} className="relative group">
                        <div onClick={() => handleOpenResume(resume)} className="cursor-pointer">
                            <Book
                                title={resume.name || "Untitled Resume"}
                                subtitle="Resume"
                                target={resume.targetCompany || resume.targetJob || "General"}
                                width={180}
                                height={260}
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
                        {/* Last updated */}
                        <p className="text-[10px] text-muted-foreground text-center mt-1">
                            {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}

                {/* Add New placeholder */}
                <div
                    onClick={() => setIsNewResumeDialogOpen(true)}
                    className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                    style={{ width: 180, height: 260 }}
                >
                    <div className="w-16 h-16 rounded-full bg-blue-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">New Resume</span>
                </div>
            </div>

            <NewResumeDialog 
                open={isNewResumeDialogOpen} 
                onOpenChange={setIsNewResumeDialogOpen} 
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your resume.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDeleteResume(deleteConfirmId)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
