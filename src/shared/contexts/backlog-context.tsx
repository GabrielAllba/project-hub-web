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

import type { BacklogActivityLog } from "@/domain/entities/backlog-activity-log"
import { useAssignBacklogUser } from "@/shared/hooks/use-assign-backlog-user"
import { useEditBacklogGoal } from "@/shared/hooks/use-edit-backlog-goal"
import { useEditBacklogPoint } from "@/shared/hooks/use-edit-backlog-point"
import { useEditBacklogPriority } from "@/shared/hooks/use-edit-backlog-priority"
import { useEditBacklogStatus } from "@/shared/hooks/use-edit-backlog-status"
import { useEditBacklogTitle } from "@/shared/hooks/use-edit-backlog-title"
import { useGetProductBacklog } from "@/shared/hooks/use-get-product-backlog"
import { useCreateProductBacklog } from "../hooks/use-create-product-backlog"
import { useDeleteBacklog } from "../hooks/use-delete-backlog"
import { useGetBacklogLogs } from "../hooks/use-get-backlog-logs"
import { useReorderProductBacklog } from "../hooks/use-reorder-product-backlog"

interface BacklogContextType {
    unassignedBacklogs: ProductBacklog[]
    totalUnassigned: number
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
    handleSetClickedBacklog: (backlogId: string) => void
    loadMoreBacklogLogs: () => Promise<void>

    clickedBacklog: string
    backlogLogs: BacklogActivityLog[]
    isBacklogLogsLoading: boolean
    hasMoreBacklogLogs: boolean
    isLoadingMoreBacklogLogs: boolean


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
    const [hasMoreUnassigned, setHasMoreUnassigned] = useState(true)
    const [loadingUnassigned, setLoadingUnassigned] = useState(false)

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<ProductBacklogStatus | undefined>()
    const [priority, setPriority] = useState<ProductBacklogPriority | undefined>()
    const [productGoalIds, setProductGoalIds] = useState<string[]>([])
    const [assigneeIds, setAssigneeIds] = useState<string[]>([])

    const [clickedBacklog, setClickedBacklog] = useState<string>("")
    const [backlogLogs, setBacklogLogs] = useState<BacklogActivityLog[]>([])
    const [isBacklogLogsLoading, setIsBacklogLogsLoading] = useState<boolean>(false)
    const [hasMoreBacklogLogs, setHasMoreBacklogLogs] = useState(false)
    const [isLoadingMoreBacklogLogs, setIsLoadingMoreBacklogLogs] = useState(false)

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
    const { triggerGetBacklogLogs } = useGetBacklogLogs("")


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
                setHasMoreUnassigned(!res.data.last)


            }
        } finally {
            setLoadingUnassigned(false)
        }
    }, [projectId, search, status, priority, productGoalIds, assigneeIds])

    const loadMoreBacklogs = useCallback(async () => {
        if (!hasMoreUnassigned) return

        try {
            const nowPage = Math.floor(unassignedBacklogs.length / DEFAULT_PAGE_SIZE)

            const res = await triggerGetProductBacklog(nowPage, DEFAULT_PAGE_SIZE, {
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
                setHasMoreUnassigned(!res.data.last)
            }
        } finally {
            setLoadingUnassigned(false)
        }
    }, [
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

    const editBacklogPoint = async (backlogId: string, newPoint: number) => {
        await triggerEditBacklogPoint({ backlogId, point: newPoint })
        setUnassignedBacklogsState((prev) => {
            return prev.filter((item) => {
                if (item.id !== backlogId) return true
                return true
            }).map((item) =>
                item.id === backlogId ? { ...item, point: newPoint } : item
            )
        })
    }

    const editBacklogTitle = async (backlogId: string, newTitle: string) => {
        await triggerEditBacklogTitle({ backlogId, title: newTitle })
        setUnassignedBacklogsState((prev) => {
            return prev.filter((item) => {
                if (item.id !== backlogId) return true
                if (search && search !== newTitle) return false
                return true
            }).map((item) =>
                item.id === backlogId ? { ...item, title: newTitle } : item
            )
        })
    }


    const editBacklogPriority = async (backlogId: string, newPriority: ProductBacklogPriority) => {
        await triggerEditBacklogPriority({ backlogId, priority: newPriority })

        setUnassignedBacklogsState((prev) => {
            return prev.filter((item) => {
                if (item.id !== backlogId) return true
                if (priority && priority !== newPriority) return false
                return true
            }).map((item) =>
                item.id === backlogId ? { ...item, priority: newPriority } : item
            )
        })
    }

    const editBacklogStatus = async (backlogId: string, newStatus: ProductBacklogStatus) => {
        await triggerEditBacklogStatus({ backlogId, status: newStatus })

        setUnassignedBacklogsState((prev) => {
            return prev
                .filter((item) => {
                    if (item.id !== backlogId) return true
                    if (status && newStatus !== status) return false
                    return true
                })
                .map((item) =>
                    item.id === backlogId ? { ...item, status: newStatus } : item
                )
        })
    }


    const editBacklogGoal = async (backlogId: string, goalId: string | null) => {
        await triggerEditBacklogGoal({ backlogId, goalId })

        setUnassignedBacklogsState((prev) =>
            prev
                .filter((item) => {
                    if (item.id !== backlogId) return true
                    if (productGoalIds.length > 0 && !productGoalIds.includes(goalId ?? "no-goal")) return false
                    return true
                })
                .map((item) =>
                    item.id === backlogId ? { ...item, goalId } : item
                )
        )
    }


    const assignBacklogUser = async (backlogId: string, assigneeId: string) => {
        await triggerAssignBacklogUser({ backlogId, assigneeId })

        setUnassignedBacklogsState((prev) =>
            prev
                .filter((item) => {
                    if (item.id !== backlogId) return true
                    if (assigneeIds.length > 0 && !assigneeIds.includes(assigneeId)) return false
                    return true
                })
                .map((item) =>
                    item.id === backlogId ? { ...item, assigneeId } : item
                )
        )
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


    const handleSetClickedBacklog = (backlogId: string) => {
        setClickedBacklog(backlogId)
    }

    const loadMoreBacklogLogs = async () => {
        if (!hasMoreBacklogLogs || isLoadingMoreBacklogLogs) return

        setIsLoadingMoreBacklogLogs(true)
        const nowPage = Math.floor(backlogLogs.length / DEFAULT_PAGE_SIZE)
        try {
            const res = await triggerGetBacklogLogs(clickedBacklog, nowPage, DEFAULT_PAGE_SIZE)
            if (res.status === "success" && res.data?.content) {
                const newLogs = res.data.content.filter(
                    (log) => !backlogLogs.some((existing) => existing.id === log.id)
                )
                setBacklogLogs((prev) => [...prev, ...newLogs])
                setHasMoreBacklogLogs(!res.data.last)
            }
        } finally {
            setIsLoadingMoreBacklogLogs(false)
        }
    }


    useEffect(() => {
        loadInitialBacklogs()
    }, [projectId, search, status, priority, productGoalIds, assigneeIds])


    useEffect(() => {
        if (clickedBacklog != "") {
            setIsBacklogLogsLoading(true)
            triggerGetBacklogLogs(clickedBacklog, DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {
                if (res.status === "success" && res.data?.content) {
                    setBacklogLogs(res.data.content)
                    setIsBacklogLogsLoading(false)
                    setHasMoreBacklogLogs(!res.data.last)
                }
            })
        }
    }, [clickedBacklog])



    return (
        <BacklogContext.Provider
            value={{
                unassignedBacklogs,
                totalUnassigned,
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
                handleSetClickedBacklog,
                loadMoreBacklogLogs,

                backlogLogs,
                clickedBacklog,
                isBacklogLogsLoading,
                hasMoreBacklogLogs,
                isLoadingMoreBacklogLogs,

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
