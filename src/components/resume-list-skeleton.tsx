import { Skeleton } from "@/components/ui/skeleton";

export function ResumeListSkeleton() {
    return (
        <div className="flex flex-wrap gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="relative">
                    {/* Book-like skeleton */}
                    <div 
                        className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-md shadow-lg"
                        style={{
                            width: "180px",
                            height: "260px"
                        }}
                    >
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4 bg-white/20 dark:bg-black/20" />
                            <Skeleton className="h-3 w-1/2 bg-white/20 dark:bg-black/20" />
                            <div className="pt-8 space-y-2">
                                <Skeleton className="h-2 w-full bg-white/20 dark:bg-black/20" />
                                <Skeleton className="h-2 w-5/6 bg-white/20 dark:bg-black/20" />
                                <Skeleton className="h-2 w-4/6 bg-white/20 dark:bg-black/20" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
