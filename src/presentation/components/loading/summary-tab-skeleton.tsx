import { Skeleton } from "../ui/skeleton"

export const SummaryTabSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Status cards (4 cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>

            {/* Chart Area (Bar/Area Chart style) */}
            <div className="w-full rounded-lg border p-4 space-y-4">
                <Skeleton className="h-6 w-48 rounded" />
                <div className="flex items-end justify-between gap-2 h-full pt-4">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Skeleton className="w-8 h-[60px] sm:h-[80px] lg:h-[100px] rounded-md" />
                            
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
