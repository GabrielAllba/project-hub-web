"use client"

import { useProjects } from "@/shared/contexts/project-context"
import { MoreHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"

export function ProjectActions({
    projectId,
    onRename,
}: {
    projectId: string
    onRename: () => void
}) {
    const { deleteProject } = useProjects()
    const navigate = useNavigate()

    const handleDelete = async () => {
        const confirmed = confirm("Are you sure you want to delete this project?")
        if (!confirmed) return

        await deleteProject(projectId)
        navigate("/dashboard")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-md cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
