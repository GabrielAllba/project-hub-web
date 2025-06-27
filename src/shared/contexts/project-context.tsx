"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { ProjectSummary } from "@/domain/entities/project-summary"
import { useArchiveProject } from "@/shared/hooks/use-archive-project"
import { useCreateProject } from "@/shared/hooks/use-create-project"
import { useGetArchivedProjects } from "@/shared/hooks/use-get-archived-projects"
import { useGetMyProject } from "@/shared/hooks/use-get-my-project"
import { useRenameProject } from "@/shared/hooks/use-rename-project"
import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useAcceptProjectInvitation } from "../hooks/use-accept-project-invitation"
import { useDeleteProject } from "../hooks/use-delete-proejct"
import { useRejectProjectInvitation } from "../hooks/use-reject-project-invitation"
import { useSearchArchivedProjects } from "../hooks/use-search-archived-projects"
import { useSearchProjects } from "../hooks/use-search-projects"
import { useUnarchiveProject } from "../hooks/use-unarchive-project"

interface ProjectContextType {
    projects: ProjectSummary[]
    recentProjects: ProjectSummary[]
    archivedProjects: ProjectSummary[]
    isInitialLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    isLoadingArchived: boolean
    hasMoreArchived: boolean
    loadMore: () => Promise<void>
    loadMoreArchivedProjects: () => Promise<void>
    createProject: (name: string) => Promise<ProjectSummary | null>
    renameProject: (projectId: string, newName: string) => Promise<ProjectSummary | null>
    deleteProject: (projectId: string) => Promise<boolean>
    archiveProject: (projectId: string) => Promise<boolean>
    unarchiveProject: (projectId: string) => Promise<boolean>
    acceptInvitation: (projectId: string) => Promise<boolean>
    rejectInvitation: (projectId: string) => Promise<boolean>
    searchProjects: (keyword: string, page?: number, size?: number) => Promise<ProjectSummary[]>
    searchArchivedProjects: (keyword: string, page?: number, size?: number) => Promise<ProjectSummary[]>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<ProjectSummary[]>([])
    const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([])
    const [archivedProjects, setArchivedProjects] = useState<ProjectSummary[]>([])
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [isLoadingArchived, setIsLoadingArchived] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [hasMoreArchived, setHasMoreArchived] = useState(true)

    const { triggerGetMyProject } = useGetMyProject()
    const { triggerCreateProject } = useCreateProject()
    const { triggerRenameProject } = useRenameProject()
    const { triggerDeleteProject } = useDeleteProject("")
    const { triggerAcceptProjectInvitation } = useAcceptProjectInvitation("")
    const { triggerRejectProjectInvitation } = useRejectProjectInvitation("")
    const { triggerSearchProjects } = useSearchProjects()
    const { triggerArchiveProject } = useArchiveProject()
    const { triggerGetArchivedProjects } = useGetArchivedProjects()
    const { triggerSearchArchivedProjects } = useSearchArchivedProjects()
    const { triggerUnarchiveProject } = useUnarchiveProject()

    const loadInitialProjects = async () => {
        setIsInitialLoading(true)
        try {
            const response = await triggerGetMyProject(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
            if (response.status === "success" && response.data) {
                setRecentProjects(response.data.content)
                setProjects(response.data.content)
                setHasMore(!response.data.last)

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
            const nowPage = Math.floor(projects.length / DEFAULT_PAGE_SIZE)
            const response = await triggerGetMyProject(nowPage, DEFAULT_PAGE_SIZE)
            if (response.status === "success" && response.data) {
                const newProjects = response.data.content ?? []
                const unique = newProjects.filter(
                    (p) => !projects.some((existing) => existing.projectId === p.projectId)
                )
                setProjects((prev) => [...prev, ...unique])
                setRecentProjects((prev) => [...prev, ...unique])
                setHasMore(!response.data.last)
            }
        } catch (err) {
            toast.error("Failed to load more projects: " + err)
        } finally {
            setIsLoadingMore(false)
        }
    }

    const loadMoreArchivedProjects = async () => {
        if (!hasMoreArchived || isLoadingArchived) return
        setIsLoadingArchived(true)
        try {
            const nowPage = Math.floor(archivedProjects.length / DEFAULT_PAGE_SIZE)
            const response = await triggerGetArchivedProjects(nowPage, DEFAULT_PAGE_SIZE)
            if (response.status === "success" && response.data) {
                const newProjects = response.data.content ?? []
                const unique = newProjects.filter(
                    (p) => !archivedProjects.some((existing) => existing.projectId === p.projectId)
                )
                setArchivedProjects((prev) => [...prev, ...unique])
                setHasMoreArchived(!response.data.last)
            }
        } catch (err) {
            toast.error("Failed to load archived projects: " + err)
        } finally {
            setIsLoadingArchived(false)
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
                setRecentProjects((prev) => [newProject, ...prev])
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
                setRecentProjects((prev) =>
                    prev.map((project) =>
                        project.projectId === projectId ? { ...project, name: response.data.name } : project
                    )
                )

                setProjects((prev) =>
                    prev.map((project) =>
                        project.projectId === projectId ? { ...project, name: response.data.name } : project
                    )
                )

                setArchivedProjects((prev) =>
                    prev.map((project) =>
                        project.projectId === projectId ? { ...project, name: response.data.name } : project
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
                setRecentProjects((prev) => prev.filter((p) => p.projectId !== projectId))
                setArchivedProjects((prev) => prev.filter((p) => p.projectId !== projectId))
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

    const archiveProject = async (projectId: string): Promise<boolean> => {
        try {
            const response = await triggerArchiveProject(projectId)
            if (response.status === "success") {
                toast.success("Project archived successfully")
                setProjects((prev) => prev.filter((p) => p.projectId !== projectId))
                setRecentProjects((prev) => prev.filter((p) => p.projectId !== projectId))
                return true
            } else {
                toast.error("Failed to archive project", {
                    description: response.message,
                })
            }
        } catch {
            toast.error("An error occurred while archiving the project.")
        }
        return false
    }

    const unarchiveProject = async (projectId: string): Promise<boolean> => {
        try {
            const response = await triggerUnarchiveProject(projectId)
            if (response.status === "success") {
                toast.success("Project unarchived successfully")

                const unarchived = archivedProjects.find(p => p.projectId === projectId)
                if (!unarchived) {
                    toast.error("Unarchived project not found in archive list.")
                    return false
                }

                setArchivedProjects(prev =>
                    prev.filter(p => p.projectId !== projectId)
                )

                setProjects(prev =>
                    prev.some(p => p.projectId === projectId)
                        ? prev
                        : [unarchived, ...prev]
                )

                setRecentProjects(prev =>
                    prev.some(p => p.projectId === projectId)
                        ? prev
                        : [unarchived, ...prev]
                )

                return true
            } else {
                toast.error("Failed to unarchive project", {
                    description: response.message,
                })
            }
        } catch {
            toast.error("An error occurred while unarchiving the project.")
        }
        return false
    }


    const acceptInvitation = async (projectId: string): Promise<boolean> => {
        try {
            const response = await triggerAcceptProjectInvitation(projectId)
            if (response.status === "success" && response.data) {
                toast.success("Invitation accepted")
                const newProject: ProjectSummary = {
                    projectId: response.data.projectId,
                    name: response.data.projectName,
                    userRole: response.data.role,
                }
                setProjects((prev) => [newProject, ...prev])
                setRecentProjects((prev) => [newProject, ...prev])
                return true
            } else {
                toast.error("Failed to accept invitation", {
                    description: response.message,
                })
                return false
            }
        } catch {
            toast.error("An error occurred while accepting the invitation.")
            return false
        }
    }

    const rejectInvitation = async (projectId: string): Promise<boolean> => {
        try {
            const response = await triggerRejectProjectInvitation(projectId)
            if (response.status === "success") {
                toast.success("Invitation rejected")
                setProjects((prev) => prev.filter((p) => p.projectId !== projectId))
                setRecentProjects((prev) => prev.filter((p) => p.projectId !== projectId))
                return true
            } else {
                toast.error("Failed to reject invitation", {
                    description: response.message,
                })
                return false
            }
        } catch {
            toast.error("An error occurred while rejecting the invitation.")
            return false
        }
    }

    const searchProjects = async (
        keyword: string,
        page: number = 0,
        size: number = DEFAULT_PAGE_SIZE
    ): Promise<ProjectSummary[]> => {
        try {
            const response = await triggerSearchProjects(keyword, page, size)
            if (response.status === "success" && response.data) {
                const searchedProjects =
                    response.data.content?.map((p) => ({
                        projectId: p.projectId,
                        name: p.name,
                        userRole: p.userRole,
                    })) ?? []

                setProjects(searchedProjects)
                setHasMore(!response.data.last)
                return searchedProjects
            } else {
                toast.error("Failed to search projects", {
                    description: response.message,
                })
                return []
            }
        } catch {
            toast.error("An error occurred while searching projects.")
            return []
        }
    }

    const searchArchivedProjects = async (
        keyword: string,
        page: number = 0,
        size: number = DEFAULT_PAGE_SIZE
    ): Promise<ProjectSummary[]> => {
        try {
            const response = await triggerSearchArchivedProjects(keyword, page, size)
            if (response.status === "success" && response.data) {
                const searchedProjects =
                    response.data.content?.map((p) => ({
                        projectId: p.projectId,
                        name: p.name,
                        userRole: p.userRole,
                    })) ?? []

                setArchivedProjects(searchedProjects)
                setHasMoreArchived(!response.data.last)
                return searchedProjects
            } else {
                toast.error("Failed to search archived projects", {
                    description: response.message,
                })
                return []
            }
        } catch {
            toast.error("An error occurred while searching archived projects.")
            return []
        }
    }

    useEffect(() => {
        loadInitialProjects()
    }, [])

    return (
        <ProjectContext.Provider
            value={{
                projects,
                recentProjects,
                archivedProjects,
                isInitialLoading,
                isLoadingMore,
                isLoadingArchived,
                hasMore,
                hasMoreArchived,
                loadMore,
                loadMoreArchivedProjects,
                createProject,
                renameProject,
                deleteProject,
                archiveProject,
                unarchiveProject,
                acceptInvitation,
                rejectInvitation,
                searchProjects,
                searchArchivedProjects,
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
