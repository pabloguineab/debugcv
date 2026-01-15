import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoverLettersPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                        <Mail className="w-6 h-6 text-blue-600" />
                        Cover Letters
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create tailored cover letters for every application
                    </p>
                </div>
            </div>

            {/* Content Placeholder */}
            <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No cover letters yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm text-center mt-2 mb-6">
                    Create your first cover letter to increase your chances of getting hired.
                </p>
                <Button>
                    Create Cover Letter
                </Button>
            </div>
        </div>
    );
}
