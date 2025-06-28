import * as React from "react"

interface BacklogSkeletonProps {
  count?: number; // Jumlah skeleton yang ingin dirender
}

export const BacklogSkeleton: React.FC<BacklogSkeletonProps> = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className="rounded-md border p-4 shadow-sm animate-pulse flex flex-col space-y-3"
    >
      
      
      
      
      <div className="flex justify-between items-center ">
        <div className="h-3 bg-gray-200 rounded w-1/5"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
  ));

  return <>{skeletons}</>;
};