// src/presentation/components/skeletons/board-skeleton.tsx
import { cn } from "@/shared/utils/merge-class"; // Assuming you have a cn utility for merging classes
import * as React from "react";

interface BoardSkeletonProps {
    columnCount?: number; // Number of columns to render (e.g., for different statuses/sprints)
    cardCountPerColumn?: number; // Number of backlog item skeletons per column
    className?: string; // Optional class for the main container
}

export const BoardSkeleton: React.FC<BoardSkeletonProps> = ({
    columnCount = 3, // Default to 3 columns (e.g., To Do, In Progress, Done)
    cardCountPerColumn = 3, // Default to 3 cards per column
    className,
}) => {
    const columnSkeletons = Array.from({ length: columnCount }, (_, colIndex) => (
        <div key={colIndex} className="flex-1 min-w-[280px] max-w-[350px] bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            {/* Column Header Skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

            {/* Card Skeletons within the column */}
            <div className="space-y-4">
                {Array.from({ length: cardCountPerColumn }, (_, cardIndex) => (
                    <div key={`${colIndex}-${cardIndex}`} className="rounded-md border p-4 flex flex-col space-y-2 bg-gray-50">
                        {/* Card Title Line */}
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        {/* Card Sub-line / Description */}
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        {/* Bottom row for points/assignee etc. */}
                        <div className="flex justify-between items-center mt-1">
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ));

    return (
        <div
            className={cn(
                "flex flex-wrap gap-6 p-6 justify-center lg:justify-start overflow-x-auto", // Responsive layout for columns
                className
            )}
        >
            {columnSkeletons}
        </div>
    );
};