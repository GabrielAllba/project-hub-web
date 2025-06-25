"use client"

import type { ProjectRole } from "@/constants/constants"
import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res"
import type { ReactNode } from "react"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import { toast } from "sonner"
import { useGetProjectMembers } from "../hooks/use-get-project-members"

interface ProjectMemberContextType {
    members: ProjectUserResponseDTO[]
    isLoading: boolean
    setRoleFilter: (role: ProjectRole | null) => void
    refreshMembers: () => Promise<void>
    triggerLoadAllMembers: () => Promise<void>
}

const ProjectMemberContext = createContext<ProjectMemberContextType | undefined>(undefined)

export const ProjectMemberProvider = ({
    projectId,
    children,
}: {
    projectId: string
    children: ReactNode
}) => {
    const [members, setMembers] = useState<ProjectUserResponseDTO[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [roleFilter, setRoleFilter] = useState<ProjectRole | null>(null)

    const { triggerGetProjectMembers } = useGetProjectMembers(projectId)

    const fetchMembers = useCallback(async () => {
        if (!roleFilter) return

        setIsLoading(true)
        try {
            const res = await triggerGetProjectMembers(roleFilter)
            if (res.status === "success" && res.data) {
                setMembers(res.data)
            } else {
                toast.error("Failed to fetch members", {
                    description: res.message,
                })
            }
        } catch (err) {
            toast.error("Unexpected error fetching members: " + err)
        } finally {
            setIsLoading(false)
        }
    }, [roleFilter])

    const triggerLoadAllMembers = useCallback(async () => {
        const roles: ProjectRole[] = ["PRODUCT_OWNER", "SCRUM_MASTER", "DEVELOPER"]
        setIsLoading(true)
        try {
            const promises = roles.map(role => triggerGetProjectMembers(role))
            const results = await Promise.all(promises)

            const successfulResponses = results.filter(r => r.status === "success" && r.data) as {
                data: ProjectUserResponseDTO[]
            }[]

            const allMembers = successfulResponses.flatMap(r => r.data)

            const uniqueMembers = Array.from(new Map(allMembers.map(m => [m.id, m])).values())

            setMembers(uniqueMembers)
        } catch (err) {
            toast.error("Failed to load all project members: " + err)
        } finally {
            setIsLoading(false)
        }
    }, [projectId, roleFilter])

    const refreshMembers = async () => {
        if (roleFilter) {
            await fetchMembers()
        } else {
            await triggerLoadAllMembers()
        }
    }

    useEffect(() => {
        if (roleFilter) {
            fetchMembers()
        } else {
            triggerLoadAllMembers()
        }
    }, [projectId])

    return (
        <ProjectMemberContext.Provider
            value={{
                members,
                isLoading,
                setRoleFilter,
                refreshMembers,
                triggerLoadAllMembers,
            }}
        >
            {children}
        </ProjectMemberContext.Provider>
    )
}

export const useProjectMembers = (): ProjectMemberContextType => {
    const context = useContext(ProjectMemberContext)
    if (!context) {
        throw new Error("useProjectMembers must be used within a ProjectMemberProvider")
    }
    return context
}
