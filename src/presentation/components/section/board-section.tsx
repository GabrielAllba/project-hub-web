"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants";
import type { ProductBacklog, ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";
import { useEditBacklogStatus } from "@/shared/hooks/use-edit-backlog-status"; // Import the missing hook
import { useGetProductBacklogBySprint } from "@/shared/hooks/use-get-product-backlog-by-sprint";
import { useReorderProductBacklog } from "@/shared/hooks/use-reorder-product-backlog";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { BacklogCard } from "../card/backlog-card";
import { DroppableContainerBoard } from "../containers/droppable-container-board";
import { toast } from "sonner";

const CONTAINERS = [
    { id: "TODO" as ProductBacklogStatus, title: "To Do" },
    { id: "INPROGRESS" as ProductBacklogStatus, title: "In Progress" },
    { id: "DONE" as ProductBacklogStatus, title: "Done" },
]

interface BoardSectionProps {
    sprintId: string
    statusFilters: ProductBacklogStatus[]
    priorityFilters: ProductBacklogPriority[]
}

export default function BoardSection(props: BoardSectionProps) {
    const [tasks, setTasks] = useState<ProductBacklog[]>([])
    const [activeTask, setActiveTask] = useState<ProductBacklog | null>(null)

    // Add backup state for rollback functionality
    const [backupTasks, setBackupTasks] = useState<ProductBacklog[]>([])

    const { triggerGetProductBacklogBySprint } = useGetProductBacklogBySprint(props.sprintId)
    const { triggerReorderProductBacklog } = useReorderProductBacklog()
    const { triggerEditBacklogStatus } = useEditBacklogStatus() // Declare the missing hook

    // Fetch tasks on sprint change
    useEffect(() => {
        const fetchTasks = async () => {
            const response = await triggerGetProductBacklogBySprint(props.sprintId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
            if (response.status === "success" && response.data) {
                setTasks(response.data.content)
            } else {
                setTasks([])
            }
        }

        if (props.sprintId) fetchTasks()
    }, [props.sprintId])

    // Apply filters to tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Status filter - if filters are selected, task must match one of them
            if (props.statusFilters.length > 0 && !props.statusFilters.includes(task.status)) {
                return false
            }

            // Priority filter - if filters are selected, task must match one of them
            if (props.priorityFilters.length > 0 && !props.priorityFilters.includes(task.priority)) {
                return false
            }

            return true
        })
    }, [tasks, props.statusFilters, props.priorityFilters])

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
    )

    // Helper function to get tasks by status (from filtered tasks)
    function getTasksByStatus(status: ProductBacklogStatus): ProductBacklog[] {
        return filteredTasks.filter((task) => task.status === status)
    }
    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        const activeId = active.id as string
        const task = tasks.find((task) => task.id === activeId)

        if (task) {
            setActiveTask(task)

            // Use the same logic as list-section for position tracking
            const originalContainerValue = task.status
            let insertPosition = -1

            // Get tasks in the same container and find the position
            const containerTasks = tasks.filter(
                (t) =>
                    t.status === originalContainerValue &&
                    (props.sprintId === "unassigned" ? t.sprintId === null : t.sprintId === props.sprintId),
            )
            insertPosition = containerTasks.findIndex((item) => item.id === activeId)

            dragStateRef.current = {
                activeId,
                originalContainer: originalContainerValue,
                currentContainer: originalContainerValue,
                originalPosition: insertPosition,
                insertPosition,
            }
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) {
            dragStateRef.current.currentContainer = dragStateRef.current.originalContainer
            dragStateRef.current.insertPosition = dragStateRef.current.originalPosition
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        const activeTask = tasks.find((task) => task.id === activeId)
        if (!activeTask) return

        let targetContainer: ProductBacklogStatus | null = null

        // Check if dropping on a container directly
        const isOverContainer = CONTAINERS.some((container) => container.id === overId)

        if (isOverContainer) {
            targetContainer = overId as ProductBacklogStatus
        } else {
            // Dropping on a task - find which container it belongs to
            const overTask = tasks.find((task) => task.id === overId)
            if (overTask) {
                targetContainer = overTask.status
            } else {
                targetContainer = dragStateRef.current.originalContainer as ProductBacklogStatus
            }
        }

        dragStateRef.current.currentContainer = targetContainer

        // Calculate insert position
        let newInsertPosition = -1
        const targetTasks = tasks.filter(
            (task) =>
                task.status === targetContainer &&
                (props.sprintId === "unassigned" ? task.sprintId === null : task.sprintId === props.sprintId),
        )

        if (isOverContainer) {
            // Dropping on container - add to end
            newInsertPosition = targetTasks.length
        } else {
            // Dropping on a specific task
            const overTask = tasks.find((task) => task.id === overId)
            if (overTask && overTask.status === targetContainer) {
                const overIndex = targetTasks.findIndex((task) => task.id === overId)
                if (overIndex >= 0) {
                    newInsertPosition = overIndex + 1 // Insert after the target task
                }
            } else {
                newInsertPosition = targetTasks.length
            }
        }

        dragStateRef.current.insertPosition = newInsertPosition

        // Update UI optimistically for cross-container moves
        if (activeTask.status !== targetContainer) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((task) => task.id === activeId)
                const activeTaskCopy = tasks[activeIndex]

                // Remove from current position
                const newTasks = tasks.filter((task) => task.id !== activeId)

                // Find insertion point in target container
                const targetTasksInArray = newTasks.filter(
                    (task) =>
                        task.status === targetContainer &&
                        (props.sprintId === "unassigned" ? task.sprintId === null : task.sprintId === props.sprintId),
                )

                let insertIndex = newTasks.length

                if (!isOverContainer) {
                    // Dropping on a specific item
                    const overTask = newTasks.find((task) => task.id === overId)
                    if (overTask) {
                        const overIndex = newTasks.findIndex((task) => task.id === overId)
                        insertIndex = overIndex
                    }
                } else {
                    // Dropping on container - add to end of container
                    if (targetTasksInArray.length > 0) {
                        const lastTaskIndex = newTasks.lastIndexOf(targetTasksInArray[targetTasksInArray.length - 1])
                        insertIndex = lastTaskIndex + 1
                    } else {
                        // Empty container - find where this container should be in the array
                        const containerIndex = CONTAINERS.findIndex((c) => c.id === targetContainer)
                        let insertPoint = 0

                        for (let i = 0; i < containerIndex; i++) {
                            const prevContainerTasks = newTasks.filter(
                                (task) =>
                                    task.status === CONTAINERS[i].id &&
                                    (props.sprintId === "unassigned" ? task.sprintId === null : task.sprintId === props.sprintId),
                            )
                            insertPoint += prevContainerTasks.length
                        }

                        insertIndex = insertPoint
                    }
                }

                // Update task status and insert at new position
                const updatedTask = {
                    ...activeTaskCopy,
                    status: targetContainer,
                    updatedAt: new Date().toISOString(),
                }

                newTasks.splice(insertIndex, 0, updatedTask)
                return newTasks
            })
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        const activeId = active.id as string

        if (!over) {
            // Reset to original state
            dragStateRef.current.currentContainer = dragStateRef.current.originalContainer
            dragStateRef.current.insertPosition = dragStateRef.current.originalPosition

            const dragState = dragStateRef.current

            toast.info(
                `API Call:\n\n` +
                `Task ID: ${dragState.activeId}\n` +
                `Action: No change (dropped outside droppable area)\n` +
                `Remains in: ${dragState.originalContainer} (position: ${dragState.originalPosition})\n\n` +
                `No API call needed  task stays in original position.`,
            )


            setActiveTask(null)
            return
        }

        const overId = over.id as string
        const activeTask = tasks.find((task) => task.id === activeId)

        if (!activeTask) {
            setActiveTask(null)
            return
        }

        // Backup current state before making changes
        setBackupTasks([...tasks])

        const targetContainer = dragStateRef.current.currentContainer as ProductBacklogStatus

        // Check if there's actually a change
        const hasChanged =
            dragStateRef.current.originalContainer !== dragStateRef.current.currentContainer ||
            dragStateRef.current.originalPosition !== dragStateRef.current.insertPosition

        // Handle same container reordering
        if (activeTask.status === targetContainer && activeId !== overId) {
            const containerTasks = tasks.filter(
                (task) =>
                    task.status === targetContainer &&
                    (props.sprintId === "unassigned" ? task.sprintId === null : task.sprintId === props.sprintId),
            )

            const activeIndex = containerTasks.findIndex((task) => task.id === activeId)
            const overIndex = containerTasks.findIndex((task) => task.id === overId)

            if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                const reorderedTasks = arrayMove(containerTasks, activeIndex, overIndex)

                // Update the insert position to the final position in the reordered array
                dragStateRef.current.insertPosition = reorderedTasks.findIndex((task) => task.id === activeId)

                // Update the full tasks array
                setTasks((tasks) => {
                    const otherTasks = tasks.filter(
                        (task) =>
                            task.status !== targetContainer ||
                            (props.sprintId === "unassigned" ? task.sprintId !== null : task.sprintId === props.sprintId),
                    )

                    const result: ProductBacklog[] = []

                    CONTAINERS.forEach((container) => {
                        if (container.id === targetContainer) {
                            result.push(...reorderedTasks)
                        } else {
                            result.push(...otherTasks.filter((task) => task.status === container.id))
                        }
                    })

                    // Add back other tasks that don't belong to current sprint
                    const nonSprintTasks = tasks.filter((task) =>
                        props.sprintId === "unassigned" ? task.sprintId !== null : task.sprintId !== props.sprintId,
                    )
                    result.push(...nonSprintTasks)

                    return result
                })
            }
        }

        // Only make API call if there's an actual change
        if (hasChanged) {
            try {
                const dragState = dragStateRef.current
                // Success - show confirmation

                toast.success(
                    `Backlog successfully updated from ${dragState.originalContainer} to ${dragState.currentContainer}`,
                )


                await triggerReorderProductBacklog({
                    activeId: dragState.activeId!,
                    originalContainer: props.sprintId,
                    currentContainer: props.sprintId,
                    insertPosition: dragState.insertPosition,
                })

                await triggerEditBacklogStatus({
                    backlogId: dragState.activeId!,
                    status: dragState.currentContainer as ProductBacklogStatus,
                })


            } catch (error) {
                console.error("Failed to reorder backlog:", error)

                // Rollback to original state
                setTasks(backupTasks)

                // Reset drag state
                dragStateRef.current.currentContainer = dragStateRef.current.originalContainer
                dragStateRef.current.insertPosition = dragStateRef.current.originalPosition

                // Show error message

                toast.error(
                    `API Call Failed:\n\n` +
                    `Error: ${error}` +
                    `Task has been restored to its original position.`,
                )


            }
        } else {
            // No change made
            toast.info(`No Change Made:\n\n` + `Task was dropped in the same position.\n` + `No API call needed.`)

        }

        setActiveTask(null)
    }

    // Get task counts for each status in current sprint (filtered)
    const getTaskCount = (status: ProductBacklogStatus) => {
        return getTasksByStatus(status).length
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Task Summary */}
            <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                <span>Total Tasks: {filteredTasks.length}</span>
                <span>To Do: {getTaskCount("TODO")}</span>
                <span>In Progress: {getTaskCount("INPROGRESS")}</span>
                <span>Done: {getTaskCount("DONE")}</span>
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">No tasks match the current filters</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your filter criteria</p>
                </div>
            )}

            {/* Drag and Drop Board */}
            {filteredTasks.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                >
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {CONTAINERS.map((container) => (
                            <DroppableContainerBoard
                                key={container.id}
                                id={container.id}
                                title={container.title}
                                tasks={getTasksByStatus(container.id)}
                            />
                        ))}
                    </div>
                    {activeTask && <DragOverlay>{<BacklogCard task={activeTask} isDragging />}</DragOverlay>}
                </DndContext>
            )}
        </div>
    )
}
