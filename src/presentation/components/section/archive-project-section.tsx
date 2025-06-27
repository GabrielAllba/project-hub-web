"use client"

import { useProjects } from "@/shared/contexts/project-context"
import { Loader2, Plus } from "lucide-react"
import { ArchivedProjectCard } from "../card/archived-project-card"
import { EmptyStateIllustration } from "../empty/empty-state"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"

export const ArchiveProjectSection = () => {
  const {
    archivedProjects,
    loadMoreArchivedProjects,
    isLoadingArchived,
    hasMoreArchived,
  } = useProjects()

  const handleLoadMore = async () => {
    if (!hasMoreArchived || isLoadingArchived) return
    await loadMoreArchivedProjects()
  }

  if (isLoadingArchived && archivedProjects.length === 0) {
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

  if (!isLoadingArchived && archivedProjects.length === 0) {
    return <EmptyStateIllustration type="no-archived-projects" />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {archivedProjects.map((project) => (
          <ArchivedProjectCard key={project.projectId} project={project} />
        ))}
      </div>

      {hasMoreArchived && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingArchived}
            variant="outline"
            className="min-w-48"
          >
            {isLoadingArchived ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more archived projects...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Load more archived projects
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
