"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/product-backlog-constants"
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { Backlog } from "@/presentation/components/containers/backlog"
import { DroppableContainerProductBacklog } from "@/presentation/components/containers/droppable-container-product-backlog"
import { DroppableContainerSprint } from "@/presentation/components/containers/droppable-container-sprint"
import { Button } from "@/presentation/components/ui/button"
import { LoadingSpinner } from "@/presentation/components/ui/loading-spinner"
import { useCreateSprint } from "@/shared/hooks/use-create-sprint"
import { useGetProductBacklog } from "@/shared/hooks/use-get-product-backlog"
import { useGetProductBacklogBySprint } from "@/shared/hooks/use-get-product-backlog-by-sprint"
import { useGetProjectSprints } from "@/shared/hooks/use-get-project-sprints"
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
import { AddProductBacklogInput } from "./add-product-backlog-input"

export default function ListSection({ projectId }: { projectId: string }) {
    const [sprints, setSprints] = useState<Sprint[]>([])
    const [unassignedBacklog, setUnassignedBacklog] = useState<ProductBacklog[]>([])
    const [sprintBacklogItems, setSprintBacklogItems] = useState<Record<string, ProductBacklog[]>>({})

    const [loadingSprints, setLoadingSprints] = useState(true)
    const [loadingUnassigned, setLoadingUnassigned] = useState(true)
    const [loadingSprintItems, setLoadingSprintItems] = useState<Record<string, boolean>>({})

    const [sprintPages, setSprintPages] = useState<Record<string, number>>({})
    const [sprintHasMore, setSprintHasMore] = useState<Record<string, boolean>>({})

    // Simplified drag state - only track what's being dragged
    const [activeId, setActiveId] = useState<string | null>(null)
    const [dragOverContainer, setDragOverContainer] = useState<string | null>(null)

    // Use ref to track drag state without causing re-renders
    const dragStateRef = useRef<{
        activeId: string | null
        originalContainer: string | null
        currentContainer: string | null
        insertPosition: number
    }>({
        activeId: null,
        originalContainer: null,
        currentContainer: null,
        insertPosition: -1,
    })

    const [currentPageProductBacklog, setCurrentPageProductBacklog] = useState(DEFAULT_PAGE)

    const [totalSprint, setTotalSprint] = useState<number>(0)

    const { triggerGetProjectSprints } = useGetProjectSprints(projectId)
    const { triggerGetProductBacklog, triggerGetProductBacklogResponse } = useGetProductBacklog(projectId)
    const { triggerGetProductBacklogBySprint } = useGetProductBacklogBySprint("")
    const { triggerCreateSprint } = useCreateSprint()
    const { triggerReorderProductBacklog, triggerReorderProductBacklogResponse } =
        useReorderProductBacklog()

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

    // Simple function to get all items - not memoized to avoid dependency issues
    const getAllItems = (): ProductBacklog[] => {
        return [...unassignedBacklog, ...Object.values(sprintBacklogItems).flat()]
    }

    // Find active item for drag overlay
    const activeItem = useMemo(() => {
        if (!activeId) return null
        return getAllItems().find((item) => item.id === activeId)
    }, [activeId, unassignedBacklog, sprintBacklogItems])

    const [currentPageSprints, setCurrentPageSprints] = useState(DEFAULT_PAGE)
    const [loadingMoreSprints, setLoadingMoreSprints] = useState(false)
    const [hasMoreSprints, setHasMoreSprints] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setLoadingSprints(true)
            const sprintsData = await triggerGetProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
            const sprints: Sprint[] = sprintsData.data.content.map(
                (dto: SprintResponseDTO): Sprint => ({
                    id: dto.id,
                    projectId: dto.projectId,
                    name: dto.name,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                    createdAt: dto.createdAt,
                    updatedAt: dto.updatedAt,
                    sprintGoal: dto.sprintGoal
                }),
            )
            setSprints(sprints)
            setLoadingSprints(false)
            setTotalSprint(sprintsData.data.totalElements)
            setHasMoreSprints(!sprintsData.data.last)

            const initialLoadingState: Record<string, boolean> = {}
            const initialPageState: Record<string, number> = {}
            const initialHasMoreState: Record<string, boolean> = {}

            sprints.forEach((sprint) => {
                initialLoadingState[sprint.id] = true
                initialPageState[sprint.id] = DEFAULT_PAGE
                initialHasMoreState[sprint.id] = true
            })

            setLoadingSprintItems(initialLoadingState)
            setSprintPages(initialPageState)
            setSprintHasMore(initialHasMoreState)

            setLoadingUnassigned(true)
            const unassignedItems = await triggerGetProductBacklog(currentPageProductBacklog, DEFAULT_PAGE_SIZE)
            setUnassignedBacklog(unassignedItems.data.content)
            setLoadingUnassigned(false)

            const sprintItems: Record<string, ProductBacklog[]> = {}

            for (const sprint of sprints) {
                const response = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
                sprintItems[sprint.id] = response.data.content

                setSprintHasMore((prev) => ({
                    ...prev,
                    [sprint.id]: !response.data.last,
                }))

                setLoadingSprintItems((prev) => ({
                    ...prev,
                    [sprint.id]: false,
                }))
            }

            setSprintBacklogItems(sprintItems)
        }

        loadData()
    }, [])

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const { active } = event
            const activeId = active.id as string

            const activeItem = getAllItems().find((item) => item.id === activeId)
            if (!activeItem) return

            const originalContainerValue = activeItem.sprintId

            // Find the original position of the item
            let insertPosition = -1
            if (originalContainerValue === null) {
                // Item is in unassigned backlog
                insertPosition = unassignedBacklog.findIndex((item) => item.id === activeId)
            } else {
                // Item is in a sprint
                const sprintItems = sprintBacklogItems[originalContainerValue] || []
                insertPosition = sprintItems.findIndex((item) => item.id === activeId)
            }

            setActiveId(activeId)

            // Update ref without causing re-render
            dragStateRef.current = {
                activeId,
                originalContainer: originalContainerValue,
                currentContainer: originalContainerValue,
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
                // Reset to original container when not over anything
                dragStateRef.current.currentContainer = dragStateRef.current.originalContainer
                return
            }

            const activeId = active.id as string
            const overId = over.id as string

            // Find the active item
            const activeItem = getAllItems().find((item) => item.id === activeId)
            if (!activeItem) return

            // Determine target container with priority order
            let targetContainer: string | null = null

            // First check if we're over a container directly
            const isOverBacklog = overId === "backlog"
            const isOverSprint = sprints.some((sprint) => sprint.id === overId)

            if (isOverBacklog) {
                targetContainer = null
                setDragOverContainer("backlog")
            } else if (isOverSprint) {
                targetContainer = overId
                setDragOverContainer(overId)
            } else {
                // Check if we're over an item, and determine its container
                const overItem = getAllItems().find((item) => item.id === overId)
                if (overItem) {
                    targetContainer = overItem.sprintId
                    setDragOverContainer(targetContainer || "backlog")
                } else {
                    // Not over any recognized element
                    setDragOverContainer(null)
                    targetContainer = dragStateRef.current.originalContainer
                }
            }

            // Always update the current container in the ref
            dragStateRef.current.currentContainer = targetContainer

            // Calculate and update insert position
            let newInsertPosition = -1
            if (targetContainer !== null || overId === "backlog") {
                // Get the target container items
                const targetItems = targetContainer === null ? unassignedBacklog : sprintBacklogItems[targetContainer] || []
                // If we're over a specific item, calculate insert position
                const overItem = getAllItems().find((item) => item.id === overId)
                if (overItem && overItem.sprintId === targetContainer) {
                    // Find the position of the item we're over
                    const overIndex = targetItems.findIndex((item) => item.id === overId)
                    if (overIndex >= 0) {
                        // Insert after the item we're over
                        newInsertPosition = overIndex + 1
                    }
                } else if (isOverBacklog || isOverSprint) {
                    // if(isOverBacklog){
                    //     alert("is over backlog")
                    // }else{
                    //     alert("is over sprint")
                    // }
                    // Dragging over container directly - append to end
                    newInsertPosition = targetItems.length
                }
            } else {
                // backlog to backlog
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

        // Remove item from current position
        if (activeItem.sprintId === null) {
            setUnassignedBacklog((prev) => prev.filter((item) => item.id !== activeId))
        } else {
            setSprintBacklogItems((prev) => ({
                ...prev,
                [activeItem.sprintId!]: prev[activeItem.sprintId!].filter((item) => item.id !== activeId),
            }))
        }

        // Restore to original position
        if (originalContainer === null) {
            // Restore to unassigned backlog
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
            // Restore to original sprint
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
                // Dropped outside any valid container - restore to original position
                restoreToOriginalPosition()
                setActiveId(null)
                dragStateRef.current = { activeId: null, originalContainer: null, currentContainer: null, insertPosition: -1 }
                return
            }

            const overId = over.id as string
            const activeItem = getAllItems().find((item) => item.id === activeId)

            if (!activeItem) {
                setActiveId(null)
                dragStateRef.current = { activeId: null, originalContainer: null, currentContainer: null, insertPosition: -1 }
                return
            }

            // Use the current container from dragStateRef which was updated during drag over
            const targetContainer = dragStateRef.current.currentContainer

            // Handle container changes
            if (activeItem.sprintId !== targetContainer) {
                // alert("1")
                // Moving between containers
                let insertIndex = -1

                // Find insertion index if dropping over an item
                const overItem = getAllItems().find((item) => item.id === overId)
                if (overItem && overItem.sprintId === targetContainer) {
                    // const targetItems = targetContainer === null ? unassignedBacklog : sprintBacklogItems[targetContainer] || []
                    // insertIndex = targetItems.findIndex((item) => item.id === over
                    insertIndex = dragStateRef.current.insertPosition
                }

                if (activeItem.sprintId === null) {
                    // alert("2")
                    // Moving from unassigned backlog to a sprint
                    setUnassignedBacklog((prev) => prev.filter((item) => item.id !== activeId))
                    if (targetContainer !== null) {
                        setSprintBacklogItems((prev) => {
                            const targetItems = [...(prev[targetContainer] || [])]
                            const newItem = { ...activeItem, sprintId: targetContainer }

                            if (insertIndex >= 0) {
                                // Insert at specific position
                                targetItems.splice(insertIndex, 0, newItem)
                            } else {
                                // Append to end
                                targetItems.push(newItem)
                            }

                            return {
                                ...prev,
                                [targetContainer]: targetItems,
                            }
                        })
                    }
                } else if (targetContainer === null) {
                    // alert("X : " + insertIndex)
                    // Moving from a sprint to unassigned backlog
                    setSprintBacklogItems((prev) => ({
                        ...prev,
                        [activeItem.sprintId!]: prev[activeItem.sprintId!].filter((item) => item.id !== activeId),
                    }))

                    setUnassignedBacklog((prev) => {
                        const newItem = { ...activeItem, sprintId: null }

                        if (insertIndex >= 0) {
                            // Insert at specific position
                            const newItems = [...prev]
                            newItems.splice(insertIndex, 0, newItem)
                            return newItems
                        } else {
                            // Append to end
                            return [...prev, newItem]
                        }
                    })
                } else {
                    // alert("89898")
                    // Moving between sprints
                    setSprintBacklogItems((prev) => {
                        const sourceItems = prev[activeItem.sprintId!].filter((item) => item.id !== activeId)
                        const targetItems = [...(prev[targetContainer] || [])]
                        const newItem = { ...activeItem, sprintId: targetContainer }

                        if (insertIndex >= 0) {
                            // Insert at specific position
                            targetItems.splice(insertIndex, 0, newItem)
                        } else {
                            // Append to end
                            targetItems.push(newItem)
                        }

                        return {
                            ...prev,
                            [activeItem.sprintId!]: sourceItems,
                            [targetContainer]: targetItems,
                        }
                    })
                }

                // Call the API with the drag state information

                // alert(JSON.stringify(dragStateRef.current))
                try {
                    // alert(JSON.stringify(dragStateRef.current))
                    await triggerReorderProductBacklog({
                        activeId: dragStateRef.current.activeId,
                        originalContainer: dragStateRef.current.originalContainer,
                        currentContainer: dragStateRef.current.currentContainer,
                        insertPosition: dragStateRef.current.insertPosition,
                    })

                    // If there's an error in the response, we could handle it here
                    if (triggerReorderProductBacklogResponse && triggerReorderProductBacklogResponse.status === "error") {
                        console.error("Error reordering backlog:", triggerReorderProductBacklogResponse.message)
                        restoreToOriginalPosition();
                    }
                } catch (error) {
                    alert("Failed to reorder backlog:" + error)
                    restoreToOriginalPosition();
                }
            } else if (
                getAllItems().find((item) => item.id === overId) &&
                activeItem.sprintId === getAllItems().find((item) => item.id === overId)?.sprintId
            ) {
                // Reordering within the same container
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

                    // Update the insert position based on the new array
                    const newItemIndex = newItems.findIndex((item) => item.id === activeId)
                    dragStateRef.current.insertPosition = newItemIndex

                    // Call the API with the updated drag state
                    // alert(JSON.stringify(dragStateRef.current))
                    try {
                        await triggerReorderProductBacklog({
                            activeId: dragStateRef.current.activeId,
                            originalContainer: dragStateRef.current.originalContainer,
                            currentContainer: dragStateRef.current.currentContainer,
                            insertPosition: dragStateRef.current.insertPosition,
                        })

                        // Handle potential error in response
                        if (triggerReorderProductBacklogResponse && triggerReorderProductBacklogResponse.status === "error") {
                            console.error("Error reordering backlog:", triggerReorderProductBacklogResponse.message)
                            // Optionally restore to original position on error
                            restoreToOriginalPosition();

                        }
                    } catch (error) {
                        console.error("Failed to reorder backlog:", error)
                        // Optionally restore to original position on error
                        restoreToOriginalPosition();

                    }
                }
            }

            // Reset drag state
            setActiveId(null)
            dragStateRef.current = { activeId: null, originalContainer: null, currentContainer: null, insertPosition: -1 }
        },
        [
            sprints,
            triggerReorderProductBacklog,
            triggerReorderProductBacklogResponse,
            unassignedBacklog,
            sprintBacklogItems,
            restoreToOriginalPosition,
        ],
    )

    const loadMoreProductBacklogs = useCallback(async () => {
        if (triggerGetProductBacklogResponse?.data && !triggerGetProductBacklogResponse.data.last) {
            try {
                const nextPage = currentPageProductBacklog + 1
                const response = await triggerGetProductBacklog(nextPage, DEFAULT_PAGE_SIZE)
                if (response.status === "success" && response.data) {
                    const backlogItems = response.data.content
                    setUnassignedBacklog((prev) => [...prev, ...backlogItems])
                    setCurrentPageProductBacklog(nextPage)
                }
            } catch (error) {
                console.error("Failed to load more product backlogs:", error)
            }
        }
    }, [currentPageProductBacklog, triggerGetProductBacklog, triggerGetProductBacklogResponse?.data])

    const loadMoreSprintBacklogs = useCallback(
        async (sprintId: string) => {
            const currentPage = sprintPages[sprintId] || DEFAULT_PAGE
            const hasMore = sprintHasMore[sprintId]

            if (hasMore) {
                try {
                    setLoadingSprintItems((prev) => ({ ...prev, [sprintId]: true }))

                    const nextPage = currentPage + 1
                    const response = await triggerGetProductBacklogBySprint(sprintId, nextPage, DEFAULT_PAGE_SIZE)

                    if (response.status === "success" && response.data) {
                        const newBacklogItems = response.data.content

                        setSprintBacklogItems((prev) => ({
                            ...prev,
                            [sprintId]: [...(prev[sprintId] || []), ...newBacklogItems],
                        }))

                        setSprintPages((prev) => ({
                            ...prev,
                            [sprintId]: nextPage,
                        }))

                        setSprintHasMore((prev) => ({
                            ...prev,
                            [sprintId]: !response.data.last,
                        }))
                    }
                } catch (error) {
                    console.error(`Failed to load more backlogs for sprint ${sprintId}:`, error)
                } finally {
                    setLoadingSprintItems((prev) => ({ ...prev, [sprintId]: false }))
                }
            }
        },
        [sprintPages, sprintHasMore, triggerGetProductBacklogBySprint],
    )

    const handleCreateSprint = useCallback(() => {
        triggerCreateSprint({ projectId: projectId, name: "Sprint " + (totalSprint + 1) }).then(() => {
            // Reload all sprints to get the updated list including the new sprint
            const reloadAllSprints = async () => {
                const allSprints: Sprint[] = []
                let currentPage = DEFAULT_PAGE
                let hasMore = true

                // Load all previously loaded pages plus any new ones
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

                // Initialize pagination state for any new sprints
                const newSprintPages: Record<string, number> = { ...sprintPages }
                const newSprintHasMore: Record<string, boolean> = { ...sprintHasMore }

                for (const sprint of allSprints) {
                    if (!newSprintPages[sprint.id]) {
                        newSprintPages[sprint.id] = DEFAULT_PAGE
                    }

                    // Only load backlog for new sprints that don't have data yet
                    if (!sprintBacklogItems[sprint.id]) {
                        const response = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
                        setSprintBacklogItems((prev) => ({ ...prev, [sprint.id]: response.data.content }))
                        newSprintHasMore[sprint.id] = !response.data.last
                    }
                }

                setSprintPages(newSprintPages)
                setSprintHasMore(newSprintHasMore)
            }

            reloadAllSprints()
        })
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

    const handleProductBacklogCreated = useCallback(async () => {
        const unassignedItems = await triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
        setCurrentPageProductBacklog(DEFAULT_PAGE)
        setUnassignedBacklog(unassignedItems.data.content)
    }, [triggerGetProductBacklog])

    const handleDeleteBacklog = (backlog: ProductBacklog) => {
        if (backlog.sprintId) {
            // Remove from sprint backlog items
            setSprintBacklogItems((prev) => ({
                ...prev,
                [backlog.sprintId!]: prev[backlog.sprintId!].filter((item) => item.id !== backlog.id),
            }))
        } else {
            // Remove from unassigned backlog
            setUnassignedBacklog((prev) => prev.filter((item) => item.id !== backlog.id))
        }

        // Refresh the data to ensure consistency
        if (backlog.sprintId) {
            // Refresh sprint backlog data
            triggerGetProductBacklogBySprint(backlog.sprintId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {
                setSprintBacklogItems((prev) => ({
                    ...prev,
                    [backlog.sprintId!]: res.data.content,
                }))
            })
        } else {
            // Refresh unassigned backlog data
            triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {
                setCurrentPageProductBacklog(DEFAULT_PAGE)
                setUnassignedBacklog(res.data.content)
            })
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
                        }),
                    )

                    setSprints((prev) => [...prev, ...newSprints])
                    setCurrentPageSprints(nextPage)
                    setHasMoreSprints(!sprintsData.data.last)

                    // Initialize state for new sprints
                    const newLoadingState: Record<string, boolean> = {}
                    const newPageState: Record<string, number> = {}
                    const newHasMoreState: Record<string, boolean> = {}

                    for (const sprint of newSprints) {
                        newLoadingState[sprint.id] = true
                        newPageState[sprint.id] = DEFAULT_PAGE

                        // Load backlog items for each new sprint
                        const response = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)

                        setSprintBacklogItems((prev) => ({
                            ...prev,
                            [sprint.id]: response.data.content,
                        }))

                        // Set hasMore based on actual response
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

    return (
        <main className="container">
            <div className="flex flex-col space-y-4">
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
                            <LoadingSpinner />
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
                                        <LoadingSpinner />
                                    ) : (
                                        <DroppableContainerSprint
                                            containerName={sprint.name}
                                            sprint={sprint}
                                            items={sprintBacklogItems[sprint.id] || []}
                                            onDeleteBacklog={(backlog) => {
                                                handleDeleteBacklog(backlog)
                                            }}
                                            onEditSprint={async () => {
                                                try {
                                                    const sprintsData = await triggerGetProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
                                                    const updatedSprints: Sprint[] = sprintsData.data.content.map(
                                                        (dto: SprintResponseDTO): Sprint => ({
                                                            id: dto.id,
                                                            projectId: dto.projectId,
                                                            name: dto.name,
                                                            startDate: dto.startDate,
                                                            endDate: dto.endDate,
                                                            createdAt: dto.createdAt,
                                                            updatedAt: dto.updatedAt,
                                                            sprintGoal: dto.sprintGoal,
                                                        }),
                                                    )

                                                    setSprints((prevSprints) => {
                                                        const updatedSprintMap = new Map(updatedSprints.map((sprint) => [sprint.id, sprint]))
                                                        return prevSprints.map((sprint) => updatedSprintMap.get(sprint.id) || sprint)
                                                    })
                                                } catch (error) {
                                                    console.error("Failed to reload sprint data after edit:", error)
                                                }
                                            }}
                                            loadingBacklog={loadingSprintItems[sprint.id]}
                                            isDraggedOver={dragOverContainer === sprint.id}
                                        />
                                    )}
                                    {sprintHasMore[sprint.id] && (
                                        <Button
                                            variant="outline"
                                            onClick={() => loadMoreSprintBacklogs(sprint.id)}
                                            disabled={loadingSprintItems[sprint.id]}
                                            className="flex mx-auto mt-2"
                                        >
                                            {loadingSprintItems[sprint.id] ? (
                                                <>
                                                    <LoadingSpinner size="sm" className="mr-2" />
                                                    Loading...
                                                </>
                                            ) : (
                                                "Load More Product Backlogs"
                                            )}
                                        </Button>
                                    )}
                                    <AddProductBacklogInput
                                        sprintId={sprint.id}
                                        projectId={projectId}
                                        onProductBacklogCreated={async () => {
                                            // Set loading state for this sprint
                                            setLoadingSprintItems((prev) => ({
                                                ...prev,
                                                [sprint.id]: true
                                            }));

                                            try {
                                                // Fetch fresh data for this sprint
                                                const response = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE);

                                                // Reset pagination state for this sprint
                                                setSprintPages((prev) => ({
                                                    ...prev,
                                                    [sprint.id]: DEFAULT_PAGE
                                                }));

                                                // Update sprint backlog items with fresh data
                                                setSprintBacklogItems((prev) => ({
                                                    ...prev,
                                                    [sprint.id]: response.data.content
                                                }));

                                                // Update has more state
                                                setSprintHasMore((prev) => ({
                                                    ...prev,
                                                    [sprint.id]: !response.data.last
                                                }));
                                            } catch (error) {
                                                console.error(`Failed to reload backlog items for sprint ${sprint.id}:`, error);
                                            } finally {
                                                // Clear loading state
                                                setLoadingSprintItems((prev) => ({
                                                    ...prev,
                                                    [sprint.id]: false
                                                }));
                                            }
                                        }} />
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
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Loading Sprints...
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
                            <LoadingSpinner />
                        ) : (
                            <>
                                <DroppableContainerProductBacklog
                                    id="backlog"
                                    items={unassignedBacklog}
                                    onDeleteBacklog={(backlog) => {
                                        handleDeleteBacklog(backlog)
                                    }}
                                    loadingUnassigned={loadingUnassigned}
                                    onCreateSprint={handleCreateSprint}
                                    totalElement={triggerGetProductBacklogResponse?.data.totalElements || 0}
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
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                Loading...
                                            </>
                                        ) : (
                                            "Load More Product Backlogs"
                                        )}
                                    </Button>
                                )}
                                <AddProductBacklogInput
                                    sprintId={null}
                                    projectId={projectId}
                                    onProductBacklogCreated={handleProductBacklogCreated} />
                            </>
                        )}
                    </div>

                    {/* Show loading overlay when reordering */}

                    <DragOverlay>
                        {activeId && activeItem ? <Backlog id={activeId} backlog={activeItem} onDeleteBacklog={() => { }} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </main>
    )
}