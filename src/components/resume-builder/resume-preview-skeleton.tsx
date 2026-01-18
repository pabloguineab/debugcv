import { Skeleton } from "@/components/ui/skeleton";

export function ResumePreviewSkeleton() {
    return (
        <div 
            className="bg-white rounded-lg mx-auto border border-gray-200 shadow-sm px-10 py-8 relative"
            style={{ 
                width: "100%",
                maxWidth: "800px",
                minHeight: "1100px"
            }}
        >
            {/* Header / Name */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Experience */}
            <div className="space-y-6 mb-8">
                <Skeleton className="h-6 w-32 mb-4" />
                
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-36" />
                        <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Education */}
            <div className="space-y-6 mb-8">
                <Skeleton className="h-6 w-32 mb-4" />
                
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-56" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-40" />
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-md" />
                    ))}
                </div>
            </div>
            

        </div>
    );
}
