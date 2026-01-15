import { Book } from "@/components/ui/book";

export default function ResumesPage() {
    return (
        <div className="flex flex-1 flex-col gap-8 p-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">My Resumes</h2>
                <p className="text-muted-foreground">Manage your resumes and create tailored versions for different job applications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center md:justify-items-start">
                <Book
                    title="Software Engineer"
                    description="Updated Oct 2024"
                    width={220}
                    height={320}
                />
                <Book
                    title="Frontend Lead"
                    description="Target: Google"
                    width={220}
                    height={320}
                />

                {/* Add New placeholder */}
                <div
                    className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                    style={{ width: 220, height: 320 }}
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
