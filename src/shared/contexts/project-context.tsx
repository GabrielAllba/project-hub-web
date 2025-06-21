"use client"

import { DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { ProjectSummary } from "@/domain/entities/project-summary"
import { useCreateProject } from "@/shared/hooks/use-create-project"
import { useGetMyProject } from "@/shared/hooks/use-get-my-project"
import { useRenameProject } from "@/shared/hooks/use-rename-project"
import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useDeleteProject } from "../hooks/use-delete-proejct"

interface ProjectContextType {
    projects: ProjectSummary[]
    isInitialLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    loadMore: () => Promise<void>
    createProject: (name: string) => Promise<ProjectSummary | null>
    renameProject: (projectId: string, newName: string) => Promise<ProjectSummary | null>
    deleteProject: (projectId: string) => Promise<boolean>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<ProjectSummary[]>([])
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const pageRef = useRef(0)

    const { triggerGetMyProject } = useGetMyProject()
    const { triggerCreateProject } = useCreateProject()
    const { triggerRenameProject } = useRenameProject()
    const { triggerDeleteProject } = useDeleteProject("")

    const loadInitialProjects = async () => {
        setIsInitialLoading(true)
        try {
            const response = await triggerGetMyProject(0, DEFAULT_PAGE_SIZE)
            if (response.status === "success" && response.data) {
                setProjects(response.data.content ?? [])
                setHasMore(!response.data.last)
                pageRef.current = 1
            }
        } catch (err) {
            toast.error("Failed to load projects: " + err)
        } finally {
            setIsInitialLoading(false)
        }
    }

    const loadMore = async () => {
        if (!hasMore || isLoadingMore) return
        setIsLoadingMore(true)
        try {
            const response = await triggerGetMyProject(pageRef.current, DEFAULT_PAGE_SIZE)
            if (response.status === "success" && response.data) {
                const newProjects = response.data.content ?? []
                const unique = newProjects.filter(
                    (p) => !projects.some((existing) => existing.projectId === p.projectId)
                )
                setProjects((prev) => [...prev, ...unique])
                setHasMore(!response.data.last)
                pageRef.current += 1
            }
        } catch (err) {
            toast.error("Failed to load more projects: " + err)
        } finally {
            setIsLoadingMore(false)
        }
    }

    const createProject = async (name: string): Promise<ProjectSummary | null> => {
        try {
            const response = await triggerCreateProject({ name })
            if (response.status === "success") {
                toast.success("Successfully created project", {
                    description: response.message,
                })

                const newProject: ProjectSummary = {
                    projectId: response.data.projectId,
                    name: response.data.name,
                    userRole: response.data.userRole,
                }

                setProjects((prev) => [newProject, ...prev])
                return newProject
            } else {
                toast.error("Failed to create project", {
                    description: response.message,
                })
            }
        } catch {
            toast.error("An error occurred while creating the project.")
        }
        return null
    }

    const renameProject = async (
        projectId: string,
        newName: string
    ): Promise<ProjectSummary | null> => {
        try {
            const response = await triggerRenameProject({ projectId, name: newName })
            if (response.status === "success" && response.data) {
                toast.success("Project renamed successfully")

                setProjects((prev) =>
                    prev.map((project) =>
                        project.projectId === projectId
                            ? { ...project, name: response.data.name }
                            : project
                    )
                )

                return response.data
            } else {
                toast.error("Failed to rename project", {
                    description: response.message,
                })
            }
        } catch {
            toast.error("An error occurred while renaming the project.")
        }
        return null
    }

    const deleteProject = async (projectId: string): Promise<boolean> => {
        try {
            const response = await triggerDeleteProject(projectId)
            if (response.status === "success") {
                toast.success("Project deleted successfully")
                setProjects((prev) => prev.filter((p) => p.projectId !== projectId))
                return true
            } else {
                toast.error("Failed to delete project", {
                    description: response.message,
                })
                return false
            }
        } catch {
            toast.error("An error occurred while deleting the project.")
            return false
        }
    }

    useEffect(() => {
        loadInitialProjects()
    }, [])

    return (
        <ProjectContext.Provider
            value={{
                projects,
                isInitialLoading,
                isLoadingMore,
                hasMore,
                loadMore,
                createProject,
                renameProject,
                deleteProject,
            }}
        >
            {children}
        </ProjectContext.Provider>
    )
}

export const useProjects = () => {
    const context = useContext(ProjectContext)
    if (!context) {
        throw new Error("useProjects must be used within a ProjectProvider")
    }
    return context
}
