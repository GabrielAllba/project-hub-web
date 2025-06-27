"use client"

import { IconArchiveOff, IconDots, IconPencil, IconTrash } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import type { ProjectSummary } from "@/domain/entities/project-summary"
import { useProjects } from "@/shared/contexts/project-context"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface ProjectCardProps {
  project: ProjectSummary
}

export const ArchivedProjectCard = ({ project }: ProjectCardProps) => {
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(project.name)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { renameProject, deleteProject, unarchiveProject } = useProjects()

  useEffect(() => {
    if (showDeleteDialog) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [showDeleteDialog])

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
      <Card className="rounded-sm border border-dashed border-zinc-300 bg-zinc-50 dark:bg-zinc-900 hover:shadow transition px-0 py-0">
        <CardContent className="flex justify-start px-2 py-2 gap-2">
          <div className="flex items-center">
            <div className="text-xl text-zinc-400">📁</div>
          </div>

          <div className="group w-full truncate">
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
                  className="text-sm font-semibold text-zinc-900 dark:text-white w-full bg-transparent border-0 border-b border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
              ) : (
                <Link
                  to={`/dashboard/project/${project.projectId}`}
                  className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 truncate hover:underline"
                >
                  {renameValue}
                </Link>
              )}

              {!isRenaming && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5 text-muted-foreground hover:text-zinc-700"
                    >
                      <IconDots size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setIsRenaming(true)
                        setRenameValue(project.name)
                      }}
                      disabled={isRenaming}
                    >
                      <IconPencil size={14} className="mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        unarchiveProject(project.projectId)
                      }}
                      className="cursor-pointer"
                    >
                      <IconArchiveOff size={14} className="mr-2" />Unarchive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-500 focus:bg-red-50 focus:text-red-600"
                    >
                      <IconTrash size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <p className="text-xs text-muted-foreground ">Archived • {project.userRole}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Delete */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowDeleteDialog(false)}
          ></div>

          {/* Content */}
          <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-lg max-w-sm w-full p-6">
            <div className="text-lg font-semibold mb-2">Delete Project</div>
            <div className="py-2 text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
