import { FileText } from "lucide-react";
import { NewResumeDialog } from "@/components/new-resume-dialog";
import { getResumes } from "@/lib/actions/resumes";
import { ResumesList } from "@/components/resumes-list";

export default async function ResumesPage() {
    // Load resumes on the server - no loading state needed!
    const resumes = await getResumes();

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

            {/* Resumes List - passes server data to client component */}
            <ResumesList initialResumes={resumes} />
        </div>
    );
}
