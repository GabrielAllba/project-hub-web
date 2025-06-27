import { IconArchive, IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { ProjectSummary } from "@/domain/entities/project-summary";
import { useProjects } from "@/shared/contexts/project-context";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ProjectCardProps {
  project: ProjectSummary;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const { renameProject, deleteProject, archiveProject } = useProjects();


  useEffect(() => {
    if (showDeleteDialog || showArchiveDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showDeleteDialog, showArchiveDialog]);

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();

    if (!trimmed || trimmed === project.name) {
      setRenameValue(project.name);
      setIsRenaming(false);
      return;
    }

    const updated = await renameProject(project.projectId, trimmed);
    if (updated) {
      setRenameValue(updated.name);
    }

    setIsRenaming(false);
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await deleteProject(project.projectId);
  };

  const handleArchive = async () => {
    setShowArchiveDialog(false);
    await archiveProject(project.projectId);
  };

  const handleRenameClick = () => {
    setIsRenaming(true);
    setRenameValue(project.name);

  };

  const handleArchiveClick = () => {
    setShowArchiveDialog(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Card className="rounded-sm border hover:shadow-md transition flex px-0 py-0 relative">
        <CardContent className="flex justify-start px-2 py-2 gap-2">
          <div className="flex items-center">
            <div className="text-xl">📁</div>
          </div>

          <div className="group w-full truncate">
            <div className="flex items-center justify-between gap-1 ">
              {isRenaming ? (
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit();
                    if (e.key === "Escape") {
                      setRenameValue(project.name);
                      setIsRenaming(false);
                    }
                  }}
                  autoFocus
                  className="text-sm font-semibold text-zinc-900 dark:text-white w-full bg-transparent border-0 border-b border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
              ) : (
                <Link
                  to={`/dashboard/project/${project.projectId}`}
                  className={`text-sm font-semibold text-zinc-900 dark:text-white truncate`}
                >
                  {renameValue}
                </Link>
              )}

              {/* Dropdown Menu Shadcn - Selalu Tampil */}
              {!isRenaming && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5 bg-white hover:bg-white text-zinc-600 hover:text-zinc-900 cursor-pointer"
                    >
                      <IconDots size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleRenameClick}
                      disabled={isRenaming}
                      className="cursor-pointer"
                    >
                      <IconPencil size={14} className="mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleArchiveClick}
                      className="cursor-pointer"
                    >
                      <IconArchive size={14} className="mr-2" />Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteClick}
                      className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                    >
                      <IconTrash size={14} className="mr-2 text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <p className="text-xs text-muted-foreground truncate">
              {project.userRole}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Delete Manual */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowDeleteDialog(false)}
          ></div>

          {/* Konten Dialog */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-sm w-full p-6 dark:bg-zinc-800 dark:text-white">
            {/* Dialog Header */}
            <div className="text-lg font-semibold mb-2">Delete Project</div>

            {/* Dialog Content */}
            <div className="py-2 text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <strong>{project.name}</strong> project? This action can't be
              undone.
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Archive Manual */}
      {showArchiveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowArchiveDialog(false)}
          ></div>

          {/* Konten Dialog */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-sm w-full p-6 dark:bg-zinc-800 dark:text-white">
            {/* Dialog Header */}
            <div className="text-lg font-semibold mb-2">Archive Project</div>

            {/* Dialog Content */}
            <div className="py-2 text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to archive{" "}
              <strong>{project.name}</strong> project? You can unarchive it later
              from the archived projects list.
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowArchiveDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="default" onClick={handleArchive}>
                Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};