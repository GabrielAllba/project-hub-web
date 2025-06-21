"use client"

import { useProjects } from "@/shared/contexts/project-context"
import { FolderOpen, Loader2, Plus } from "lucide-react"
import { ProjectCard } from "../card/project-card"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"

export const ProjectSection = () => {
  const {
    projects,
    isInitialLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useProjects()

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return
    await loadMore()
  }

  if (isInitialLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-xl shadow-sm space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FolderOpen className="w-12 h-12 text-blue-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
        <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
          Start your journey by creating your first project. Manage and monitor all your projects in one place.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.projectId} projectId={project.projectId} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="min-w-48"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more projects...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Load more projects
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
