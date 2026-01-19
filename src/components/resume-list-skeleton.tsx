import { Skeleton } from "@/components/ui/skeleton";

export function ResumeListSkeleton() {
    return (
        <div className="flex flex-wrap gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="relative">
                    {/* Book-like skeleton matching the real Book component */}
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                        style={{
                            width: "180px",
                            height: "260px"
                        }}
                    >
                        {/* Book cover content */}
                        <div className="h-full p-5 flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            {/* Top section */}
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-3/4 bg-blue-200/40 dark:bg-blue-800/40" />
                                <Skeleton className="h-4 w-1/2 bg-blue-200/30 dark:bg-blue-800/30" />
                            </div>
                            
                            {/* Middle decorative lines */}
                            <div className="space-y-2 opacity-30">
                                <Skeleton className="h-2 w-full bg-gray-300 dark:bg-gray-600" />
                                <Skeleton className="h-2 w-5/6 bg-gray-300 dark:bg-gray-600" />
                                <Skeleton className="h-2 w-4/6 bg-gray-300 dark:bg-gray-600" />
                                <Skeleton className="h-2 w-5/6 bg-gray-300 dark:bg-gray-600" />
                                <Skeleton className="h-2 w-3/6 bg-gray-300 dark:bg-gray-600" />
                            </div>
                            
                            {/* Bottom section */}
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-2/3 bg-emerald-200/40 dark:bg-emerald-800/40" />
                                <Skeleton className="h-3 w-1/2 bg-gray-200/40 dark:bg-gray-700/40" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
