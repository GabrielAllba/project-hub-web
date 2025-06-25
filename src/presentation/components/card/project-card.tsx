import { IconPencil, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import type { ProjectSummary } from "@/domain/entities/project-summary"
import { useProjects } from "@/shared/contexts/project-context"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

interface ProjectCardProps {
  project: ProjectSummary
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isHoveringTitle, setIsHoveringTitle] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(project.name)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { renameProject, deleteProject } = useProjects()

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim()

    if (!trimmed || trimmed === project.name) {
      setRenameValue(project.name)
      setIsRenaming(false)
      return
    }

    const updated = await renameProject(project.projectId, trimmed)
    if (updated) {
      setRenameValue(updated.name)
    }

    setIsRenaming(false)
  }

  const handleDelete = async () => {
    setShowDeleteDialog(false)
    await deleteProject(project.projectId)
  }

  return (
    <>
      <Card className="rounded-sm border hover:shadow-md transition flex px-0 py-0">
        <CardContent className="flex justify-start px-2 py-2 gap-2">
          <div className="flex items-center">
            <div className="text-xl">📁</div>
          </div>

          <div
            className="group w-full truncate"
            onMouseEnter={() => setIsHoveringTitle(true)}
            onMouseLeave={() => setIsHoveringTitle(false)}
          >
            <div className="flex items-center justify-between gap-1 ">
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
                  className="text-sm font-semibold text-zinc-900 dark:text-white w-full bg-transparent border-0 border-b border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500"
                />

              ) : (
                <Link
                  to={`/dashboard/project/${project.projectId}`}
                  className={`text-sm font-semibold text-zinc-900 dark:text-white truncate ${isHoveringTitle ? "underline" : ""}`}
                >
                  {renameValue}
                </Link>
              )}

              {isHoveringTitle && !isRenaming && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 bg-white hover:bg-white hover:text-blue-600 cursor-pointer"
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
                    className="w-5 h-5 bg-white hover:bg-white text-red-500 hover:text-red-500 cursor-pointer"
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm">
            Are you sure you want to delete{" "}
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
