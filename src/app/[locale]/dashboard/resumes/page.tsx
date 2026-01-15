import { Book } from "@/components/ui/book";
import { FileText } from "lucide-react";

export default function ResumesPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                        <FileText className="w-6 h-6 text-blue-600" />
                        CV Builder
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your resumes and create tailored versions for different job applications
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <Book
                    title="Software Engineer"
                    subtitle="Resume"
                    target="Google"
                    width={180}
                    height={260}
                />
                <Book
                    title="Frontend Lead"
                    subtitle="Resume"
                    target="Meta"
                    width={180}
                    height={260}
                />

                {/* Add New placeholder */}
                <div
                    className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                    style={{ width: 180, height: 260 }}
                >
                    <div className="w-16 h-16 rounded-full bg-blue-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Create New Resume</span>
                </div>
            </div>
        </div>
    );
}
