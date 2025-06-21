import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { IconPencil, IconTrash } from "@tabler/icons-react"

import type { ProjectSummary } from "@/domain/entities/project-summary"
import { useGetProjectById } from "@/shared/hooks/use-get-project-by-id"
import { useProjects } from "@/shared/contexts/project-context"

import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { LoadingSpinner } from "../loading/loading-spinner"

interface ProjectCardProps {
  projectId: string
}

export const ProjectCard = ({ projectId }: ProjectCardProps) => {
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isHoveringTitle, setIsHoveringTitle] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { triggerGetProjectById } = useGetProjectById(projectId)
  const { renameProject, deleteProject } = useProjects()

  useEffect(() => {
    setIsLoading(true)
    triggerGetProjectById(projectId)
      .then((res) => {
        if (res.status === "success") {
          setProject(res.data)
          setRenameValue(res.data.name)
        }
      })
      .finally(() => setIsLoading(false))
  }, [projectId])

  const handleRenameSubmit = async () => {
    if (!project) return
    const trimmed = renameValue.trim()

    if (!trimmed || trimmed === project.name) {
      setRenameValue(project.name)
      setIsRenaming(false)
      return
    }

    const updated = await renameProject(project.projectId, trimmed)
    if (updated) {
      setProject(updated)
    }

    setIsRenaming(false)
  }

  const handleDelete = async () => {
    setShowDeleteDialog(false)
    if (!project) return
    await deleteProject(project.projectId)
  }

  if (isLoading || !project) {
    return (
      <Card className="rounded-md w-[200px] h-[180px] bg-muted flex items-center justify-center">
        <LoadingSpinner message="" />
      </Card>
    )
  }

  return (
    <>
      <Card className="rounded-md border hover:shadow-md transition flex flex-col justify-between py-4">
        <CardContent className="flex flex-col h-full px-4 justify-between">
          {/* Project Initial Icon */}
          <div className="bg-gray-100 w-full p-4 rounded-sm flex items-center justify-center text-white text-lg font-bold">
            <div className="bg-[#2563EB] rounded-sm py-3 p-4 text-xs">
              {project.name.slice(0, 1).toUpperCase()}
            </div>
          </div>

          {/* Project Name + Hover Actions */}
          <div
            className="space-y-1 mt-4 group"
            onMouseEnter={() => setIsHoveringTitle(true)}
            onMouseLeave={() => setIsHoveringTitle(false)}
          >
            <div className="flex items-center justify-between gap-1">
              {isRenaming ? (
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit()
                    if (e.key === "Escape") {
                      setRenameValue(project.name)
                      setIsRenaming(false)
                    }
                  }}
                  autoFocus
                  className="text-sm font-semibold text-zinc-900 dark:text-white bg-transparent border-0 border-b border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 w-full truncate"
                />
              ) : (
                <Link
                  to={`/dashboard/project/${project.projectId}`}
                  className={`text-sm font-semibold text-zinc-900 dark:text-white truncate ${isHoveringTitle ? "underline" : ""}`}
                >
                  {project.name}
                </Link>
              )}

              {isHoveringTitle && !isRenaming && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 bg-muted hover:bg-muted/70 hover:text-blue-500 cursor-pointer"
                    onClick={() => {
                      setIsRenaming(true)
                      setRenameValue(project.name)
                    }}
                  >
                    <IconPencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 bg-muted hover:bg-muted/70 text-red-500 hover:text-red-500 cursor-pointer"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground truncate">
              {project.userRole}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm">
            Are you sure want to delete{" "}
            <strong>{project.name}</strong> project? This action can't be undone.
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
