import { Skeleton } from "../ui/skeleton"

export const ProjectDetailSkeleton = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                {/* Project name */}
                <Skeleton className="h-6 w-64 rounded" />
                {/* Avatars */}
                <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="w-9 h-9 rounded-full" />
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex w-full border-b border-zinc-200">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 px-3 py-2 text-center"
                    >
                        <Skeleton className="h-8 mx-auto" />
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex justify-between items-center mt-2">
                <div className="flex gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="w-32 h-8 rounded-md" />
                    ))}
                </div>
                <Skeleton className="w-48 h-8 rounded-md" />
            </div>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Left - Product Goal */}
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-5 w-40" />
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-md" />
                    ))}
                </div>

                {/* Right - Product Backlog */}
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-5 w-48" />
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    )
}
