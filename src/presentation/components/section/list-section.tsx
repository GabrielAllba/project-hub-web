"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { DroppableContainerProductBacklog } from "@/presentation/components/containers/droppable-container-product-backlog"
import { DroppableContainerSprint } from "@/presentation/components/containers/droppable-container-sprint"
import { BacklogItem } from "@/presentation/components/items/backlog-item"
import { Button } from "@/presentation/components/ui/button"
import { useProductGoals } from "@/shared/contexts/product-goals-context"
import { useCreateSprint } from "@/shared/hooks/use-create-sprint"
import { useGetProductBacklog } from "@/shared/hooks/use-get-product-backlog"
import { useGetProductBacklogBySprint } from "@/shared/hooks/use-get-product-backlog-by-sprint"
import { useGetProjectSprints } from "@/shared/hooks/use-get-project-sprints"
import { useGetProjectSprintsAllStatus } from "@/shared/hooks/use-get-project-sprints-all-status"
import { useGetSprintById } from "@/shared/hooks/use-get-sprint-by-id"
import { useReorderProductBacklog } from "@/shared/hooks/use-reorder-product-backlog"
import {
    closestCorners,
    DndContext,
    DragOverlay,
    MouseSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useGetProductBacklogById } from "../../../shared/hooks/use-get-product-backlog-by-id"
import { AddProductBacklogInput } from "../input/add-product-backlog-input"
import { BacklogSkeleton } from "../loading/backlog-skeleton"

interface ListSectionProps {
    projectId: string
    statusFilter?: string[]
    priorityFilter?: string[]
    searchQuery?: string
}

export default function ListSection({
    projectId,
    statusFilter = [],
    priorityFilter = [],
    searchQuery = "",
}: ListSectionProps) {
    const [sprints, setSprints] = useState<Sprint[]>([])
    const [unassignedBacklog, setUnassignedBacklog] = useState<ProductBacklog[]>([])
    const [sprintBacklogItems, setSprintBacklogItems] = useState<Record<string, ProductBacklog[]>>({})

    const [loadingSprints, setLoadingSprints] = useState(true)
    const [loadingUnassigned, setLoadingUnassigned] = useState(true)
    const [loadingSprintItems, setLoadingSprintItems] = useState<Record<string, boolean>>({})
    const [sprintTotalElements, setSprintTotalElements] = useState<Record<string, number>>({})

    const [sprintPages, setSprintPages] = useState<Record<string, number>>({})
    const [sprintHasMore, setSprintHasMore] = useState<Record<string, boolean>>({})

    const [activeId, setActiveId] = useState<string | null>(null)
    const [dragOverContainer, setDragOverContainer] = useState<string | null>(null)
    const [unassignedBacklogTotalElements, setUnassignedBacklogTotalElements] = useState<number>(0)

    // Get selected goals from context
    const { selectedGoalIds } = useProductGoals()

    const dragStateRef = useRef<{
        activeId: string | null
        originalContainer: string | null
        currentContainer: string | null
        originalPosition: number
        insertPosition: number
    }>({
        activeId: null,
        originalContainer: null,
        currentContainer: null,
        originalPosition: -1,
        insertPosition: -1,
    })

    const [currentPageProductBacklog, setCurrentPageProductBacklog] = useState(DEFAULT_PAGE)
    const [totalSprint, setTotalSprint] = useState<number>(0)

    const { triggerGetProjectSprints } = useGetProjectSprints(projectId)
    const { triggerGetProductBacklog, triggerGetProductBacklogResponse } = useGetProductBacklog(projectId)
    const { triggerGetProductBacklogBySprint } = useGetProductBacklogBySprint("")
    const { triggerCreateSprint } = useCreateSprint()
    const { triggerReorderProductBacklog } = useReorderProductBacklog()
    const { triggerGetSprintById } = useGetSprintById("")
    const { triggerGetProductBacklogById } = useGetProductBacklogById("")
    const { triggerGetProjectSprintsAllStatus } = useGetProjectSprintsAllStatus(projectId)

    // Filter function for backlog items based on all filters
    const filterBacklogItems = useCallback(
        (backlogs: ProductBacklog[]) => {
            return backlogs.filter((backlog) => {
                // Filter by product goals
                if (selectedGoalIds.size > 0) {
                    const hasNoGoalSelected = selectedGoalIds.has("no-goal")
                    const hasMatchingGoal = backlog.productGoalId && selectedGoalIds.has(backlog.productGoalId)
                    const hasNoGoal = !backlog.productGoalId && hasNoGoalSelected

                    if (!hasMatchingGoal && !hasNoGoal) {
                        return false
                    }
                }

                // Filter by status
                if (statusFilter.length > 0 && !statusFilter.includes(backlog.status)) {
                    return false
                }

                // Filter by priority
                if (priorityFilter.length > 0 && !priorityFilter.includes(backlog.priority)) {
                    return false
                }

                // Filter by search query
                if (searchQuery && !backlog.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false
                }

                return true
            })
        },
        [selectedGoalIds, statusFilter, priorityFilter, searchQuery],
    )

    // Filtered backlog items
    const filteredUnassignedBacklog = useMemo(() => {
        return filterBacklogItems(unassignedBacklog)
    }, [unassignedBacklog, filterBacklogItems])

    const filteredSprintBacklogItems = useMemo(() => {
        const filtered: Record<string, ProductBacklog[]> = {}
        Object.keys(sprintBacklogItems).forEach((sprintId) => {
            filtered[sprintId] = filterBacklogItems(sprintBacklogItems[sprintId])
        })
        return filtered
    }, [sprintBacklogItems, filterBacklogItems])

    const getAllItems = (): ProductBacklog[] => {
        return [...unassignedBacklog, ...Object.values(sprintBacklogItems).flat()]
    }

    const activeItem = useMemo(() => {
        if (!activeId) return null
        return getAllItems().find((item) => item.id === activeId)
    }, [activeId, unassignedBacklog, sprintBacklogItems])

    const [currentPageSprints, setCurrentPageSprints] = useState(DEFAULT_PAGE)
    const [loadingMoreSprints, setLoadingMoreSprints] = useState(false)
    const [hasMoreSprints, setHasMoreSprints] = useState(true)

    const loadData = async () => {
        setLoadingSprints(true)
        const sprintsData = await triggerGetProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
        const sprints: Sprint[] = sprintsData.data.content.map(
            (dto: SprintResponseDTO): Sprint => ({
                id: dto.id,
                projectId: dto.projectId,
                name: dto.name,
                startDate: dto.startDate,
                endDate: dto.endDate,
                createdAt: dto.createdAt,
                updatedAt: dto.updatedAt,
                sprintGoal: dto.sprintGoal,
                status: dto.status,
            })
        );
        setLoadingSprints(false)
        setSprints(sprints);
        setTotalSprint(sprintsData.data.totalElements);
        setHasMoreSprints(!sprintsData.data.last);

        const initialLoadingState: Record<string, boolean> = {};
        const initialPageState: Record<string, number> = {};
        const initialHasMoreState: Record<string, boolean> = {};

        sprints.forEach((sprint) => {
            initialLoadingState[sprint.id] = true;
            initialPageState[sprint.id] = DEFAULT_PAGE;
            initialHasMoreState[sprint.id] = true;
        });

        setLoadingSprintItems(initialLoadingState);
        setSprintPages(initialPageState);
        setSprintHasMore(initialHasMoreState);

        setLoadingUnassigned(true);
        const unassignedItems = await triggerGetProductBacklog(currentPageProductBacklog, DEFAULT_PAGE_SIZE);
        setUnassignedBacklog(unassignedItems.data.content);
        setUnassignedBacklogTotalElements(unassignedItems.data.totalElements);
        setLoadingUnassigned(false);

        // Initialize sprintItems state before the loop
        setSprintBacklogItems({});

        for (const sprint of sprints) {
            const response = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE);

            // Update sprintItems directly within the loop
            setSprintBacklogItems((prev) => ({
                ...prev,
                [sprint.id]: response.data.content,
            }));

            setSprintTotalElements((prev) => ({
                ...prev,
                [sprint.id]: response.data.totalElements,
            }));

            setSprintHasMore((prev) => ({
                ...prev,
                [sprint.id]: !response.data.last,
            }));

            setLoadingSprintItems((prev) => ({
                ...prev,
                [sprint.id]: false,
            }));
        }
    };

    useEffect(() => {
        loadData()
    }, [projectId])


    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const { active } = event
            const activeId = active.id as string

            const activeItem = getAllItems().find((item) => item.id === activeId)
            if (!activeItem) return

            const activeItemIndex = getAllItems().indexOf(activeItem)

            const originalContainerValue = activeItem.sprintId

            let insertPosition = -1
            if (originalContainerValue === null) {
                insertPosition = unassignedBacklog.findIndex((item) => item.id === activeId)
            } else {
                const sprintItems = sprintBacklogItems[originalContainerValue] || []
                insertPosition = sprintItems.findIndex((item) => item.id === activeId)
            }

            setActiveId(activeId)

            dragStateRef.current = {
                activeId,
                originalContainer: originalContainerValue,
                currentContainer: originalContainerValue,
                originalPosition: activeItemIndex,
                insertPosition,
            }
        },
        [unassignedBacklog, sprintBacklogItems],
    )

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event
            if (!over) {
                setDragOverContainer(null)
                dragStateRef.current.currentContainer = dragStateRef.current.originalContainer
                return
            }

            const activeId = active.id as string
            const overId = over.id as string

            const activeItem = getAllItems().find((item) => item.id === activeId)
            if (!activeItem) return

            let targetContainer: string | null = null

            const isOverBacklog = overId === "backlog"
            const isOverSprint = sprints.some((sprint) => sprint.id === overId)

            if (isOverBacklog) {
                targetContainer = null
                setDragOverContainer("backlog")
            } else if (isOverSprint) {
                targetContainer = overId
                setDragOverContainer(overId)
            } else {
                const overItem = getAllItems().find((item) => item.id === overId)
                if (overItem) {
                    targetContainer = overItem.sprintId
                    setDragOverContainer(targetContainer || "backlog")
                } else {
                    setDragOverContainer(null)
                    targetContainer = dragStateRef.current.originalContainer
                }
            }

            dragStateRef.current.currentContainer = targetContainer

            let newInsertPosition = -1
            if (targetContainer !== null || overId === "backlog") {
                const targetItems = targetContainer === null ? unassignedBacklog : sprintBacklogItems[targetContainer] || []
                const overItem = getAllItems().find((item) => item.id === overId)
                if (overItem && overItem.sprintId === targetContainer) {
                    const overIndex = targetItems.findIndex((item) => item.id === overId)
                    if (overIndex >= 0) {
                        newInsertPosition = overIndex + 1
                    }
                } else if (isOverBacklog || isOverSprint) {
                    newInsertPosition = targetItems.length
                }
            } else {
                if (dragStateRef.current.originalContainer == null) {
                    const overItem = unassignedBacklog.find((item) => item.id === overId)
                    if (overItem) {
                        const overIndex = unassignedBacklog.findIndex((item) => item.id === overId)
                        newInsertPosition = overIndex + 1
                    }
                } else {
                    const targetItems = targetContainer === null ? unassignedBacklog : sprintBacklogItems[targetContainer] || []
                    const overItem = getAllItems().find((item) => item.id === overId)
                    if (overItem) {
                        const overIndex = targetItems.findIndex((item) => item.id === overId)
                        newInsertPosition = overIndex + 1
                    }
                }
            }

            dragStateRef.current.insertPosition = newInsertPosition
        },
        [sprints, unassignedBacklog, sprintBacklogItems],
    )

    const restoreToOriginalPosition = useCallback(() => {
        const { activeId, originalContainer, insertPosition } = dragStateRef.current
        if (!activeId) return

        const activeItem = getAllItems().find((item) => item.id === activeId)
        if (!activeItem) return

        if (activeItem.sprintId === null) {
            setUnassignedBacklog((prev) => prev.filter((item) => item.id !== activeId))
        } else {
            setSprintBacklogItems((prev) => ({
                ...prev,
                [activeItem.sprintId!]: prev[activeItem.sprintId!].filter((item) => item.id !== activeId),
            }))
        }

        if (originalContainer === null) {
            setUnassignedBacklog((prev) => {
                const newItems = [...prev]
                const restoredItem = { ...activeItem, sprintId: null }
                if (insertPosition >= 0 && insertPosition < newItems.length) {
                    newItems.splice(insertPosition, 0, restoredItem)
                } else {
                    newItems.push(restoredItem)
                }
                return newItems
            })
        } else {
            setSprintBacklogItems((prev) => {
                const sprintItems = [...(prev[originalContainer] || [])]
                const restoredItem = { ...activeItem, sprintId: originalContainer }
                if (insertPosition >= 0 && insertPosition < sprintItems.length) {
                    sprintItems.splice(insertPosition, 0, restoredItem)
                } else {
                    sprintItems.push(restoredItem)
                }
                return {
                    ...prev,
                    [originalContainer]: sprintItems,
                }
            })
        }
    }, [])

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event
            const activeId = active.id as string

            setDragOverContainer(null)

            if (!over) {
                restoreToOriginalPosition()
                setActiveId(null)
                dragStateRef.current = {
                    activeId: null,
                    originalContainer: null,
                    currentContainer: null,
                    originalPosition: -1,
                    insertPosition: -1,
                }
                return
            }

            const overId = over.id as string
            const activeItem = getAllItems().find((item) => item.id === activeId)

            if (!activeItem) {
                setActiveId(null)
                dragStateRef.current = {
                    activeId: null,
                    originalContainer: null,
                    currentContainer: null,
                    originalPosition: -1,
                    insertPosition: -1,
                }
                return
            }

            const targetContainer = dragStateRef.current.currentContainer

            // Store the current state before optimistic update for rollback
            const prevUnassignedBacklog = [...unassignedBacklog]
            const prevSprintBacklogItems = { ...sprintBacklogItems }
            const prevUnassignedBacklogTotalElements = unassignedBacklogTotalElements
            const prevSprintTotalElements = { ...sprintTotalElements }

            // --- OPTIMISTIC UI UPDATE ---
            let insertIndex = -1
            const overItem = getAllItems().find((item) => item.id === overId)
            if (overItem && overItem.sprintId === targetContainer) {
                insertIndex = dragStateRef.current.insertPosition
            }

            if (activeItem.sprintId !== targetContainer) {
                // Case 1: Moving between different containers (Unassigned <-> Sprint, or Sprint <-> Sprint)

                // Remove from original container
                if (activeItem.sprintId === null) {
                    // From Unassigned
                    setUnassignedBacklog((prev) => prev.filter((item) => item.id !== activeId))
                    setUnassignedBacklogTotalElements((prev) => Math.max(0, prev - 1))
                } else {
                    // From Sprint
                    setSprintBacklogItems((prev) => ({
                        ...prev,
                        [activeItem.sprintId!]: prev[activeItem.sprintId!].filter((item) => item.id !== activeId),
                    }))
                    setSprintTotalElements((prev) => ({
                        ...prev,
                        [activeItem.sprintId!]: Math.max(0, (prev[activeItem.sprintId!] || 0) - 1),
                    }))
                }

                // Add to target container
                const newItem = { ...activeItem, sprintId: targetContainer }
                if (targetContainer === null) {
                    // To Unassigned
                    setUnassignedBacklog((prev) => {
                        const newItems = [...prev]
                        if (insertIndex >= 0 && insertIndex <= newItems.length) {
                            newItems.splice(insertIndex, 0, newItem)
                        } else {
                            newItems.push(newItem)
                        }
                        return newItems
                    })
                    setUnassignedBacklogTotalElements((prev) => prev + 1)
                } else {
                    // To Sprint
                    setSprintBacklogItems((prev) => {
                        const targetItems = [...(prev[targetContainer] || [])]
                        if (insertIndex >= 0 && insertIndex <= targetItems.length) {
                            targetItems.splice(insertIndex, 0, newItem)
                        } else {
                            targetItems.push(newItem)
                        }
                        return {
                            ...prev,
                            [targetContainer]: targetItems,
                        }
                    })
                    setSprintTotalElements((prev) => ({
                        ...prev,
                        [targetContainer]: (prev[targetContainer] || 0) + 1,
                    }))
                }
            } else if (
                // Case 2: Reordering within the same container
                activeItem.sprintId === targetContainer
            ) {
                const containerItems = targetContainer === null ? unassignedBacklog : sprintBacklogItems[targetContainer]
                const activeIndex = containerItems.findIndex((item) => item.id === activeId)
                const overIndex = containerItems.findIndex((item) => item.id === overId)

                if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                    const newItems = arrayMove(containerItems, activeIndex, overIndex)

                    if (targetContainer === null) {
                        setUnassignedBacklog(newItems)
                    } else {
                        setSprintBacklogItems((prev) => ({
                            ...prev,
                            [targetContainer]: newItems,
                        }))
                    }
                    dragStateRef.current.insertPosition = newItems.findIndex((item) => item.id === activeId)
                }
            }

            // --- API CALL ---
            try {
                await triggerReorderProductBacklog({
                    activeId: dragStateRef.current.activeId,
                    originalContainer: dragStateRef.current.originalContainer,
                    currentContainer: dragStateRef.current.currentContainer,
                    insertPosition: dragStateRef.current.insertPosition,
                })
            } catch (error) {
                console.error("Failed to reorder backlog:", error)
                // --- ROLLBACK UI ON API FAILURE ---
                setUnassignedBacklog(prevUnassignedBacklog)
                setSprintBacklogItems(prevSprintBacklogItems)
                setUnassignedBacklogTotalElements(prevUnassignedBacklogTotalElements)
                setSprintTotalElements(prevSprintTotalElements)
                restoreToOriginalPosition()
            }

            setActiveId(null)
            dragStateRef.current = {
                activeId: null,
                originalContainer: null,
                currentContainer: null,
                originalPosition: -1,
                insertPosition: -1,
            }
        },
        [
            sprints,
            triggerReorderProductBacklog,
            unassignedBacklog,
            sprintBacklogItems,
            restoreToOriginalPosition,
            setUnassignedBacklog,
            setSprintBacklogItems,
            setUnassignedBacklogTotalElements,
            setSprintTotalElements,
            sprintHasMore,
            sprintPages,
            triggerGetProductBacklogBySprint,
            currentPageProductBacklog,
            triggerGetProductBacklog,
        ],
    )

    const loadMoreProductBacklogs = useCallback(async () => {
        if (triggerGetProductBacklogResponse?.data && !triggerGetProductBacklogResponse.data.last) {
            try {
                const nowPage = Math.floor(unassignedBacklog.length / DEFAULT_PAGE_SIZE)
                const response = await triggerGetProductBacklog(nowPage, DEFAULT_PAGE_SIZE)

                if (response.status === "success" && response.data) {
                    const newBacklogItems = response.data.content
                    setUnassignedBacklog((prev) => {
                        const uniqueNewItems = newBacklogItems.filter(
                            (newItem) => !prev.some((existingItem) => existingItem.id === newItem.id),
                        )
                        return [...prev, ...uniqueNewItems]
                    })
                    setCurrentPageProductBacklog(nowPage)
                    setUnassignedBacklogTotalElements(response.data.totalElements)
                }
            } catch (error) {
                console.error("Failed to load more product backlogs:", error)
            }
        }
    }, [
        currentPageProductBacklog,
        triggerGetProductBacklog,
        triggerGetProductBacklogResponse?.data,
        setUnassignedBacklog,
        setUnassignedBacklogTotalElements,
    ])

    const loadMoreSprintBacklogs = useCallback(
        async (sprintId: string) => {
            const hasMore = sprintHasMore[sprintId]
            if (hasMore) {
                try {
                    const nowPage = Math.floor(sprintBacklogItems[sprintId].length / DEFAULT_PAGE_SIZE)

                    const response = await triggerGetProductBacklogBySprint(sprintId, nowPage, DEFAULT_PAGE_SIZE)

                    if (response.status === "success" && response.data) {
                        const fetchedNewBacklogItems = response.data.content

                        setSprintBacklogItems((prev) => {
                            const currentSprintItems = [...(prev[sprintId] || [])]
                            const uniqueNewItems = fetchedNewBacklogItems.filter(
                                (newItem) => !currentSprintItems.some((existingItem) => existingItem.id === newItem.id),
                            )
                            return {
                                ...prev,
                                [sprintId]: [...currentSprintItems, ...uniqueNewItems],
                            }
                        })

                        setSprintPages((prev) => ({
                            ...prev,
                            [sprintId]: nowPage,
                        }))

                        setSprintTotalElements((prev) => ({
                            ...prev,
                            [sprintId]: response.data.totalElements,
                        }))

                        setSprintHasMore((prev) => ({
                            ...prev,
                            [sprintId]: !response.data.last,
                        }))
                    }
                } catch (error) {
                    console.error(`Failed to load more sprint backlogs for sprint ${sprintId}:`, error)
                } finally {
                    // setLoadingSprint((prev) => ({ ...prev, [sprintId]: false })); // If you have a loading state
                }
            }
        },
        [
            sprintPages,
            sprintHasMore,
            triggerGetProductBacklogBySprint,
            setSprintBacklogItems,
            setSprintPages,
            setSprintTotalElements,
            setSprintHasMore,
            // Add sprint specific loading states if you use them
        ],
    )

    const reloadAllSprints = async () => {
        const allSprints: Sprint[] = []
        let currentPage = DEFAULT_PAGE
        let hasMore = true

        while (hasMore && currentPage <= currentPageSprints + 1) {
            const res = await triggerGetProjectSprints(currentPage, DEFAULT_PAGE_SIZE)
            const sprintsData: Sprint[] = res.data.content.map(
                (dto: SprintResponseDTO): Sprint => ({
                    id: dto.id,
                    projectId: dto.projectId,
                    name: dto.name,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                    createdAt: dto.createdAt,
                    updatedAt: dto.updatedAt,
                    sprintGoal: dto.sprintGoal,
                    status: dto.status
                }),
            )

            allSprints.push(...sprintsData)
            hasMore = !res.data.last

            if (currentPage === DEFAULT_PAGE) {
                setTotalSprint(res.data.totalElements)
                setHasMoreSprints(!res.data.last)
            } else if (currentPage > currentPageSprints) {
                setCurrentPageSprints(currentPage)
                setHasMoreSprints(!res.data.last)
            }

            currentPage++
        }

        setSprints(allSprints)

        const newSprintPages: Record<string, number> = { ...sprintPages }
        const newSprintHasMore: Record<string, boolean> = { ...sprintHasMore }

        for (const sprint of allSprints) {
            if (!newSprintPages[sprint.id]) {
                newSprintPages[sprint.id] = DEFAULT_PAGE
            }

            if (!sprintBacklogItems[sprint.id]) {
                const response = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
                setSprintBacklogItems((prev) => ({ ...prev, [sprint.id]: response.data.content }))
                newSprintHasMore[sprint.id] = !response.data.last
            }
        }

        setSprintPages(newSprintPages)
        setSprintHasMore(newSprintHasMore)
    }

    const handleCreateSprint = useCallback(async () => {
        const res = await triggerGetProjectSprintsAllStatus(0, 1)
        const totalElement = res?.data.totalElements ? res?.data.totalElements : 0

        try {

            await triggerCreateSprint({ projectId: projectId, name: "Sprint " + (totalElement + 1) })
            reloadAllSprints()
        } catch (err) {
            const baseError = err as BaseResponse<null>
            toast.error(baseError.message)
        }

    }, [
        projectId,
        totalSprint,
        currentPageSprints,
        sprintPages,
        sprintHasMore,
        sprintBacklogItems,
        triggerCreateSprint,
        triggerGetProjectSprints,
        triggerGetProductBacklogBySprint,
    ])

    const handleProductBacklogCreated = useCallback(
        async (createdBacklog: ProductBacklog) => {
            const firstPage = DEFAULT_PAGE
            let currentPage = firstPage
            let allItems: ProductBacklog[] = []
            let hasMore = true

            try {
                while (hasMore) {
                    const response = await triggerGetProductBacklog(currentPage, DEFAULT_PAGE_SIZE)

                    if (response.status === "success" && response.data) {
                        allItems = [...allItems, ...response.data.content]
                        const foundNewItem = response.data.content.some((item) => item.id === createdBacklog.id)
                        if (foundNewItem || response.data.last) {
                            hasMore = false
                        } else {
                            currentPage++
                        }
                    } else {
                        hasMore = false
                    }
                }
                setUnassignedBacklog(allItems)
                setUnassignedBacklogTotalElements(allItems.length)
                setCurrentPageProductBacklog(currentPage)
            } catch (error) {
                console.error("Error fetching updated unassigned backlog items:", error)
            }
        },
        [triggerGetProductBacklog],
    )

    const handleDeleteBacklog = async (backlog: ProductBacklog) => {
        if (backlog.sprintId) {
            if (sprintBacklogItems[backlog.sprintId].length <= DEFAULT_PAGE_SIZE) {
                const response = await triggerGetProductBacklogBySprint(backlog.sprintId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
                setSprintBacklogItems((prev) => ({
                    ...prev,
                    [backlog.sprintId!]: response.data.content,
                }))
                setSprintTotalElements((prev) => ({
                    ...prev,
                    [backlog.sprintId!]: response.data.totalElements,
                }))
                setSprintHasMore((prev) => ({
                    ...prev,
                    [backlog.sprintId!]: !response.data.last,
                }))
            } else {
                setSprintBacklogItems((prev) => ({
                    ...prev,
                    [backlog.sprintId!]: prev[backlog.sprintId!].filter((item) => item.id !== backlog.id),
                }))
                setSprintTotalElements((prev) => ({
                    ...prev,
                    [backlog.sprintId!]: sprintTotalElements[backlog.sprintId!] - 1,
                }))
            }
        } else {
            if (unassignedBacklog.length <= DEFAULT_PAGE_SIZE) {
                setCurrentPageProductBacklog(DEFAULT_PAGE)
                const response = await triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
                setUnassignedBacklog(response.data.content)
                setUnassignedBacklogTotalElements(response.data.totalElements)
            } else {
                setUnassignedBacklog((prev) => prev.filter((item) => item.id !== backlog.id))
                setUnassignedBacklogTotalElements(unassignedBacklogTotalElements - 1)
            }
        }
    }

    const loadMoreSprints = useCallback(async () => {
        if (hasMoreSprints) {
            try {
                setLoadingMoreSprints(true)
                const nextPage = currentPageSprints + 1
                const sprintsData = await triggerGetProjectSprints(nextPage, DEFAULT_PAGE_SIZE)

                if (sprintsData.status === "success" && sprintsData.data) {
                    const newSprints: Sprint[] = sprintsData.data.content.map(
                        (dto: SprintResponseDTO): Sprint => ({
                            id: dto.id,
                            projectId: dto.projectId,
                            name: dto.name,
                            startDate: dto.startDate,
                            endDate: dto.endDate,
                            createdAt: dto.createdAt,
                            updatedAt: dto.updatedAt,
                            sprintGoal: dto.sprintGoal,
                            status: dto.status
                        }),
                    )

                    setSprints((prev) => [...prev, ...newSprints])
                    setCurrentPageSprints(nextPage)
                    setHasMoreSprints(!sprintsData.data.last)

                    const newLoadingState: Record<string, boolean> = {}
                    const newPageState: Record<string, number> = {}
                    const newHasMoreState: Record<string, boolean> = {}

                    for (const sprint of newSprints) {
                        newLoadingState[sprint.id] = true
                        newPageState[sprint.id] = DEFAULT_PAGE

                        const response = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)

                        setSprintBacklogItems((prev) => ({
                            ...prev,
                            [sprint.id]: response.data.content,
                        }))

                        setSprintTotalElements((prev) => ({
                            ...prev,
                            [sprint.id]: response.data.totalElements,
                        }))

                        newHasMoreState[sprint.id] = !response.data.last

                        newLoadingState[sprint.id] = false

                    }

                    setLoadingSprintItems((prev) => ({ ...prev, ...newLoadingState }))
                    setSprintPages((prev) => ({ ...prev, ...newPageState }))
                    setSprintHasMore((prev) => ({ ...prev, ...newHasMoreState }))

                }
            } catch (error) {
                console.error("Failed to load more sprints:", error)
            } finally {
                setLoadingMoreSprints(false)
            }
        }
    }, [currentPageSprints, hasMoreSprints, triggerGetProjectSprints, triggerGetProductBacklogBySprint])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
    )

    return (
        <main className="container">
            <div className="flex flex-col space-y-4">
                {/* Show filter indicator when filters are active */}
                {(selectedGoalIds.size > 0 || statusFilter.length > 0 || priorityFilter.length > 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                            Filtering applied:
                            {selectedGoalIds.size > 0 &&
                                ` ${selectedGoalIds.size} product goal${selectedGoalIds.size > 1 ? "s" : ""}`}
                            {statusFilter.length > 0 && ` ${statusFilter.length} status${statusFilter.length > 1 ? "es" : ""}`}
                            {priorityFilter.length > 0 &&
                                ` ${priorityFilter.length} priorit${priorityFilter.length > 1 ? "ies" : "y"}`}
                        </p>
                    </div>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}

                >
                    {loadingSprints ? (
                        <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
                            <h2 className="font-semibold mb-3">Loading Sprints...</h2>
                            <BacklogSkeleton count={1} />
                        </div>
                    ) : (
                        <>
                            {sprints.map((sprint) => (
                                <div
                                    key={sprint.id}
                                    className={`p-4 rounded-sm border border-gray-200 transition-colors ${dragOverContainer === sprint.id ? "bg-gray-100" : "bg-gray-50"
                                        }`}
                                >
                                    {loadingSprintItems[sprint.id] ? (
                                        <BacklogSkeleton count={1} />) : (
                                        <DroppableContainerSprint
                                            containerName={sprint.name}
                                            sprint={sprint}
                                            items={filteredSprintBacklogItems[sprint.id] || []}
                                            totalElement={sprintTotalElements[sprint.id] || 0}
                                            onDeleteBacklog={(backlog) => {
                                                handleDeleteBacklog(backlog)
                                            }}
                                            onEditBacklog={async (backlogId: string) => {
                                                const backlogResponse = await triggerGetProductBacklogById(backlogId)

                                                if (backlogResponse.status === "success" && backlogResponse.data) {
                                                    const updatedBacklog: ProductBacklog = backlogResponse.data
                                                    setSprintBacklogItems((prev) => ({
                                                        ...prev,
                                                        [updatedBacklog.sprintId!]: prev[updatedBacklog.sprintId!].map((item) =>
                                                            item.id === backlogId ? updatedBacklog : item,
                                                        ),
                                                    }))
                                                }
                                            }}
                                            onEditSprint={async (sprintId: string) => {
                                                const sprintResponse = await triggerGetSprintById(sprintId)

                                                if (sprintResponse.status === "success" && sprintResponse.data) {
                                                    const updatedSprint: Sprint = {
                                                        id: sprintResponse.data.id,
                                                        projectId: sprintResponse.data.projectId,
                                                        name: sprintResponse.data.name,
                                                        startDate: sprintResponse.data.startDate,
                                                        endDate: sprintResponse.data.endDate,
                                                        createdAt: sprintResponse.data.createdAt,
                                                        updatedAt: sprintResponse.data.updatedAt,
                                                        sprintGoal: sprintResponse.data.sprintGoal,
                                                        status: sprintResponse.data.status
                                                    }

                                                    setSprints((prevSprints) =>
                                                        prevSprints.map((sprint) => (sprint.id === sprintId ? updatedSprint : sprint)),
                                                    )
                                                }
                                            }}
                                            onCompleteSprint={async () => {
                                                await loadData()
                                            }}
                                            loadingBacklog={loadingSprintItems[sprint.id]}
                                            isDraggedOver={dragOverContainer === sprint.id}
                                        />
                                    )}
                                    {!loadingSprintItems[sprint.id] && sprintHasMore[sprint.id] && (
                                        <Button
                                            variant="outline"
                                            onClick={() => loadMoreSprintBacklogs(sprint.id)}
                                            disabled={loadingSprintItems[sprint.id]}
                                            className="flex mx-auto mt-2"
                                        >
                                            Load More Product Backlogs
                                        </Button>
                                    )}
                                    {!loadingSprintItems[sprint.id] && <AddProductBacklogInput
                                        sprintId={sprint.id}
                                        projectId={projectId}
                                        onProductBacklogCreated={async (createdBacklog: ProductBacklog) => {
                                            const firstPage = DEFAULT_PAGE

                                            let currentPage = firstPage
                                            let allItems: ProductBacklog[] = []
                                            let hasMore = true

                                            try {
                                                while (hasMore) {
                                                    const response = await triggerGetProductBacklogBySprint(
                                                        sprint.id,
                                                        currentPage,
                                                        DEFAULT_PAGE_SIZE,
                                                    )

                                                    if (response.status === "success" && response.data) {
                                                        allItems = [...allItems, ...response.data.content]

                                                        const foundNewItem = response.data.content.some((item) => item.id === createdBacklog.id)

                                                        if (foundNewItem || response.data.last) {
                                                            setSprintHasMore((prev) => ({
                                                                ...prev,
                                                                [sprint.id]: !response.data.last,
                                                            }))

                                                            hasMore = false
                                                        } else {
                                                            currentPage++
                                                        }
                                                    } else {
                                                        hasMore = false
                                                    }
                                                }

                                                setSprintBacklogItems((prev) => ({
                                                    ...prev,
                                                    [sprint.id]: allItems,
                                                }))

                                                setSprintPages((prev) => ({
                                                    ...prev,
                                                    [sprint.id]: currentPage,
                                                }))
                                                setSprintTotalElements((prev) => ({
                                                    ...prev,
                                                    [sprint.id]: Math.max(0, (prev[sprint.id] || 0) + 1),
                                                }))
                                            } catch (error) {
                                                console.error("Error fetching updated backlog items:", error)
                                            }
                                        }}
                                    />}

                                </div>
                            ))}
                            {hasMoreSprints && (
                                <Button
                                    variant="outline"
                                    onClick={loadMoreSprints}
                                    disabled={loadingMoreSprints}
                                    className="flex mx-auto mt-2"
                                >
                                    {loadingMoreSprints ? (
                                        <>
                                            <BacklogSkeleton count={1} />
                                        </>
                                    ) : (
                                        "Load More Sprints"
                                    )}
                                </Button>
                            )}
                        </>
                    )}
                    <div
                        className={`p-4 rounded-sm border border-gray-200 transition-colors ${dragOverContainer === "backlog" ? "bg-gray-100" : "bg-gray-50"
                            }`}
                    >
                        {loadingUnassigned ? (
                            <BacklogSkeleton count={1} />
                        ) : (
                            <>
                                <DroppableContainerProductBacklog
                                    id="backlog"
                                    items={filteredUnassignedBacklog}
                                    onDeleteBacklog={(backlog) => {
                                        handleDeleteBacklog(backlog)
                                    }}
                                    onEditBacklogPoint={async (backlogId: string) => {
                                        const backlogResponse = await triggerGetProductBacklogById(backlogId)

                                        if (backlogResponse.status === "success" && backlogResponse.data) {
                                            const updatedBacklog: ProductBacklog = backlogResponse.data

                                            setUnassignedBacklog((prev) =>
                                                prev.map((item) => (item.id === backlogId ? updatedBacklog : item)),
                                            )
                                        }
                                    }}
                                    loadingUnassigned={loadingUnassigned}
                                    onCreateSprint={handleCreateSprint}
                                    totalElement={unassignedBacklogTotalElements || 0}
                                    isDraggedOver={dragOverContainer === "backlog"}
                                />
                                {!triggerGetProductBacklogResponse?.data.last && (
                                    <Button
                                        variant="outline"
                                        onClick={loadMoreProductBacklogs}
                                        disabled={loadingUnassigned}
                                        className="flex mx-auto mt-2"
                                    >
                                        {loadingUnassigned ? (
                                            <>
                                                <BacklogSkeleton count={1} />                                            </>
                                        ) : (
                                            "Load More Product Backlogs"
                                        )}
                                    </Button>
                                )}
                                {!loadingUnassigned && <AddProductBacklogInput
                                    sprintId={null}
                                    projectId={projectId}
                                    onProductBacklogCreated={handleProductBacklogCreated}
                                />}

                            </>
                        )}
                    </div>

                    <DragOverlay>
                        {activeId && activeItem ? (
                            <BacklogItem
                                backlog={activeItem}
                                onDeleteBacklog={() => { }}
                                onEditBacklog={() => { }} />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </main>
    )
}
