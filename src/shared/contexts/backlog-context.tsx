"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { BaseResponse } from "@/domain/dto/base-response"
import type {
    ProductBacklog,
    ProductBacklogPriority,
    ProductBacklogStatus,
} from "@/domain/entities/product-backlog"
import { toast } from "sonner"

import { useAssignBacklogUser } from "@/shared/hooks/use-assign-backlog-user"
import { useEditBacklogGoal } from "@/shared/hooks/use-edit-backlog-goal"
import { useEditBacklogPoint } from "@/shared/hooks/use-edit-backlog-point"
import { useEditBacklogPriority } from "@/shared/hooks/use-edit-backlog-priority"
import { useEditBacklogStatus } from "@/shared/hooks/use-edit-backlog-status"
import { useEditBacklogTitle } from "@/shared/hooks/use-edit-backlog-title"
import { useGetProductBacklog } from "@/shared/hooks/use-get-product-backlog"
import { useCreateProductBacklog } from "../hooks/use-create-product-backlog"
import { useDeleteBacklog } from "../hooks/use-delete-backlog"
import { useReorderProductBacklog } from "../hooks/use-reorder-product-backlog"

interface BacklogContextType {
    unassignedBacklogs: ProductBacklog[]
    totalUnassigned: number
    currentPage: number
    hasMoreUnassigned: boolean
    loadingUnassigned: boolean
    search: string
    status?: ProductBacklogStatus
    priority?: ProductBacklogPriority
    productGoalIds?: string[]
    assigneeIds?: string[]

    setSearch: (search: string) => void
    setStatus: (status: ProductBacklogStatus | undefined) => void
    setPriority: (priority: ProductBacklogPriority | undefined) => void
    setProductGoalIds: (productGoalIds: string[]) => void
    setAssigneeIds: (assigneeIds: string[]) => void


    loadInitialBacklogs: () => Promise<void>
    loadMoreBacklogs: () => Promise<void>
    refreshUnassignedBacklogs: () => Promise<void>
    createUnassignedBacklog: (title: string) => Promise<BaseResponse<ProductBacklog>>
    deleteUnassignedBacklog: (id: string) => Promise<void>
    editBacklogPoint: (backlogId: string, point: number) => Promise<void>
    editBacklogTitle: (backlogId: string, title: string) => Promise<void>
    editBacklogPriority: (backlogId: string, priority: ProductBacklogPriority) => Promise<void>
    editBacklogStatus: (backlogId: string, status: ProductBacklogStatus) => Promise<void>
    editBacklogGoal: (backlogId: string, goalId: string | null) => Promise<void>
    assignBacklogUser: (backlogId: string, assigneeId: string) => Promise<void>
    removeBacklogItem: (id: string) => void
    insertBacklogItemAt: (item: ProductBacklog, position: number) => void
}

const BacklogContext = createContext<BacklogContextType | undefined>(undefined)

export const BacklogProvider = ({ projectId, children }: { projectId: string; children: ReactNode }) => {
    const [unassignedBacklogs, setUnassignedBacklogsState] = useState<ProductBacklog[]>([])
    const [totalUnassigned, setTotalUnassigned] = useState(0)
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
    const [hasMoreUnassigned, setHasMoreUnassigned] = useState(true)
    const [loadingUnassigned, setLoadingUnassigned] = useState(false)

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<ProductBacklogStatus | undefined>()
    const [priority, setPriority] = useState<ProductBacklogPriority | undefined>()
    const [productGoalIds, setProductGoalIds] = useState<string[]>([])
    const [assigneeIds, setAssigneeIds] = useState<string[]>([])

    const { triggerCreateProductBacklog } = useCreateProductBacklog()
    const { triggerGetProductBacklog } = useGetProductBacklog(projectId)
    const { triggerEditBacklogPoint } = useEditBacklogPoint()
    const { triggerEditBacklogTitle } = useEditBacklogTitle()
    const { triggerEditBacklogPriority } = useEditBacklogPriority()
    const { triggerEditBacklogStatus } = useEditBacklogStatus()
    const { triggerEditBacklogGoal } = useEditBacklogGoal()
    const { triggerAssignBacklogUser } = useAssignBacklogUser()
    const { triggerDeleteBacklog } = useDeleteBacklog("")
    const { triggerReorderProductBacklog } = useReorderProductBacklog()

    const loadInitialBacklogs = useCallback(async () => {
        setLoadingUnassigned(true)
        try {
            const res = await triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, {
                search,
                status,
                priority,
                productGoalIds,
                assigneeIds
            })
            if (res.status === "success") {
                setUnassignedBacklogsState(res.data.content)
                setTotalUnassigned(res.data.totalElements)
                setCurrentPage(DEFAULT_PAGE)
                setHasMoreUnassigned(!res.data.last)
            }
        } finally {
            setLoadingUnassigned(false)
        }
    }, [projectId, search, status, priority, productGoalIds, assigneeIds])

    const loadMoreBacklogs = useCallback(async () => {
        if (!hasMoreUnassigned) return

        setLoadingUnassigned(true)
        try {
            const nextPage = currentPage + 1
            const res = await triggerGetProductBacklog(nextPage, DEFAULT_PAGE_SIZE, {
                search,
                status,
                priority,
                productGoalIds,
                assigneeIds
            })
            if (res.status === "success") {
                const newItems = res.data.content.filter(
                    (newItem) => !unassignedBacklogs.some((existing) => existing.id === newItem.id)
                )
                setUnassignedBacklogsState((prev) => [...prev, ...newItems])
                setTotalUnassigned(res.data.totalElements)
                setCurrentPage(nextPage)
                setHasMoreUnassigned(!res.data.last)
            }
        } finally {
            setLoadingUnassigned(false)
        }
    }, [
        currentPage,
        hasMoreUnassigned,
        unassignedBacklogs,
        search,
        status,
        priority,
        productGoalIds,
        assigneeIds
    ])

    const refreshUnassignedBacklogs = async () => {
        try {
            const res = await triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, {
                search,
                status,
                priority,
                productGoalIds,
                assigneeIds
            })
            setUnassignedBacklogsState(res.data.content)
            setTotalUnassigned(res.data.totalElements)
            setCurrentPage(DEFAULT_PAGE)
            setHasMoreUnassigned(false)
        } catch (err) {
            toast.error("Error refreshing unassigned backlog: " + err)
        }
    }

    const createUnassignedBacklog = async (title: string): Promise<BaseResponse<ProductBacklog>> => {
        try {
            const res = await triggerCreateProductBacklog({ title, sprintId: null }, projectId);
            if (res.status === "success" && res.data) {
                await insertBacklogItemAt(res.data, 0);
                toast.success("Unassigned backlog created successfully!");
            } else {
                toast.error(`Failed to create unassigned backlog: ${res.message || "Unknown error"}`);
            }
            return res;
        } catch (error) {
            toast.error(`An unexpected error occurred while creating unassigned backlog: ${error}`);
            return { status: "error", message: error || "Unexpected error" } as BaseResponse<ProductBacklog>;
        }
    };
    const deleteUnassignedBacklog = async (id: string) => {
        await triggerDeleteBacklog(id)
        setUnassignedBacklogsState((prev) => prev.filter((item) => item.id !== id))
        setTotalUnassigned((prev) => Math.max(0, prev - 1))
    }

    const editBacklogPoint = async (backlogId: string, point: number) => {
        await triggerEditBacklogPoint({ backlogId, point })
        await loadInitialBacklogs()
    }

    const editBacklogTitle = async (backlogId: string, title: string) => {
        await triggerEditBacklogTitle({ backlogId, title })
        await loadInitialBacklogs()
    }

    const editBacklogPriority = async (backlogId: string, priority: ProductBacklogPriority) => {
        await triggerEditBacklogPriority({ backlogId, priority })
        await loadInitialBacklogs()
    }

    const editBacklogStatus = async (backlogId: string, status: ProductBacklogStatus) => {
        await triggerEditBacklogStatus({ backlogId, status })
        await loadInitialBacklogs()
    }

    const editBacklogGoal = async (backlogId: string, goalId: string | null) => {
        await triggerEditBacklogGoal({ backlogId, goalId })
        await loadInitialBacklogs()
    }

    const assignBacklogUser = async (backlogId: string, assigneeId: string) => {
        await triggerAssignBacklogUser({ backlogId, assigneeId })
        await loadInitialBacklogs()
    }

    const removeBacklogItem = (id: string) => {
        setUnassignedBacklogsState((prev) => prev.filter((item) => item.id !== id))
        setTotalUnassigned((prev) => Math.max(0, prev - 1))
    }

    const insertBacklogItemAt = async (item: ProductBacklog, position: number) => {
        setUnassignedBacklogsState((prev) => {
            const newItems = [...prev]
            if (position >= 0 && position <= newItems.length) {
                newItems.splice(position, 0, item)
            } else {
                newItems.push(item)
            }
            return newItems
        })
        setTotalUnassigned((prev) => prev + 1)

        await triggerReorderProductBacklog({
            activeId: item.id,
            originalContainer: item.sprintId ?? null,
            currentContainer: null,
            insertPosition: position,
        })
    }

    useEffect(() => {
        loadInitialBacklogs()
    }, [projectId, search, status, priority, productGoalIds, assigneeIds])

    return (
        <BacklogContext.Provider
            value={{
                unassignedBacklogs,
                totalUnassigned,
                currentPage,
                hasMoreUnassigned,
                loadingUnassigned,
                search,
                status,
                priority,
                productGoalIds,
                assigneeIds,

                setSearch,
                setStatus,
                setPriority,
                setProductGoalIds,
                loadInitialBacklogs,
                setAssigneeIds,

                loadMoreBacklogs,
                refreshUnassignedBacklogs,
                createUnassignedBacklog,
                deleteUnassignedBacklog,
                editBacklogPoint,
                editBacklogTitle,
                editBacklogPriority,
                editBacklogStatus,
                editBacklogGoal,
                assignBacklogUser,
                removeBacklogItem,
                insertBacklogItemAt,
            }}
        >
            {children}
        </BacklogContext.Provider>
    )
}

export const useBacklog = (): BacklogContextType => {
    const context = useContext(BacklogContext)
    if (!context) throw new Error("useBacklog must be used within BacklogProvider")
    return context
}
