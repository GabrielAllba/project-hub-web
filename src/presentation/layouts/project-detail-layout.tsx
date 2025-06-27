"use client"

import type { ProjectSummary } from "@/domain/entities/project-summary"
import { Avatar, AvatarFallback } from "@/presentation/components/ui/avatar"
import { useProjects } from "@/shared/contexts/project-context"
import { ProjectMemberProvider, useProjectMembers } from "@/shared/contexts/project-member-context"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"

interface Props {
    children: ReactNode
    tabs: ReactNode
    project: ProjectSummary
}

const MAX_VISIBLE_MEMBERS = 3

const MemberAvatars = () => {
    const { members } = useProjectMembers()
    const navigate = useNavigate()

    if (!members || members.length === 0) return null

    const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS)
    const remainingCount = members.length - MAX_VISIBLE_MEMBERS

    return (
        <TooltipProvider>
            <div className="flex -space-x-2">
                {visibleMembers.map((member) => (
                    <Tooltip key={member.id}>
                        <TooltipTrigger asChild>
                            <Avatar
                                className="cursor-pointer h-8 w-8 border-2 border-white ring-1 ring-slate-200 transition hover:scale-105"
                            >
                                <AvatarFallback
                                    className={cn(
                                        "text-sm font-semibold text-white bg-gradient-to-br",
                                        getGradientForUser(member.username.charAt(0).toUpperCase())
                                    )}
                                >
                                    {getUserInitials(member.username)}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">{member.username}</TooltipContent>
                    </Tooltip>
                ))}

                {remainingCount > 0 && (
                    <div
                        onClick={() => navigate("?tab=team")}
                        className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-200 text-xs font-medium text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition"
                    >
                        +{remainingCount}
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}

export const ProjectLayout = ({ children, project, tabs }: Props) => {
    return (
        <ProjectMemberProvider projectId={project.projectId}>
            <Layout children={children} tabs={tabs} project={project} />
        </ProjectMemberProvider>
    )
}

const Layout = ({ children, tabs, project }: Props) => {
    const { projects, recentProjects, archivedProjects, renameProject, deleteProject } = useProjects()
    
    const selectedProject =
        projects.find((p) => p.projectId === project.projectId) ||
        recentProjects.find((p) => p.projectId === project.projectId) ||
        archivedProjects.find((p) => p.projectId === project.projectId)

    const [tempName, setTempName] = useState(selectedProject?.name ?? project.name)
    const [isRenaming, setIsRenaming] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const inputRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const [hover, setHover] = useState(false)

    useEffect(() => {
        if (selectedProject?.name && selectedProject.name !== tempName) {
            setTempName(selectedProject.name)
        }
    }, [selectedProject?.name])

    const handleRenameConfirm = async () => {
        const trimmed = tempName.trim()
        if (!trimmed || trimmed === selectedProject?.name) {
            setIsRenaming(false)
            return
        }
        await renameProject(project.projectId, trimmed)
        setIsRenaming(false)
    }

    const handleDelete = async () => {
        setShowDeleteDialog(false)
        await deleteProject(project.projectId)
        navigate("/dashboard")
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="rounded-md bg-white flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-500">Project</p>
                    <div
                        className="flex items-center gap-2 group"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        {isRenaming ? (
                            <input
                                ref={inputRef}
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleRenameConfirm}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRenameConfirm()
                                    if (e.key === "Escape") {
                                        setTempName(selectedProject?.name ?? project.name)
                                        setIsRenaming(false)
                                    }
                                }}
                                className="text-xl font-semibold text-zinc-900 dark:text-white w-full bg-transparent border-0 border-b border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500"
                            />
                        ) : (
                            <h1 className="text-xl font-semibold flex items-center gap-2">
                                📁 {selectedProject?.name ?? project.name}
                            </h1>
                        )}

                        {hover && !isRenaming && (
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-5 h-5 bg-white hover:bg-white hover:text-blue-600 cursor-pointer"
                                    onClick={() => {
                                        setIsRenaming(true)
                                        setTimeout(() => inputRef.current?.focus(), 0)
                                    }}
                                >
                                    <IconPencil size={14} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-5 h-5 bg-white text-red-500 hover:text-red-600 cursor-pointer"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <IconTrash size={14} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <MemberAvatars />
            </div>

            {/* Tabs */}
            {tabs}

            {/* Content */}
            <div>{children}</div>

            {/* 🧨 Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                    </DialogHeader>

                    <div className="py-2 text-sm">
                        Are you sure you want to delete{" "}
                        <strong>{selectedProject?.name ?? project.name}</strong> project? This action can't be undone.
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}