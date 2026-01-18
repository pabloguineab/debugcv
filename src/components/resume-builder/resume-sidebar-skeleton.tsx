import { Skeleton } from "@/components/ui/skeleton";

export function ResumeSidebarSkeleton() {
    return (
        <div className="h-full flex flex-col gap-6 p-6 border-r bg-background">
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
