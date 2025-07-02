"use client"

import type { ProductBacklog, ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";
import { useSprint } from "@/shared/contexts/sprint-context";
import { useEditBacklogStatus } from "@/shared/hooks/use-edit-backlog-status";
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
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BacklogCard } from "../card/backlog-card";
import { DroppableContainerBoard } from "../containers/droppable-container-board";
import { EmptyStateIllustration } from "../empty/empty-state";
import { BoardSkeleton } from "../loading/board-skeleton";
import { Button } from "../ui/button";

const CONTAINERS = [
    { id: "TODO" as ProductBacklogStatus, title: "To Do" },
    { id: "INPROGRESS" as ProductBacklogStatus, title: "In Progress" },
    { id: "DONE" as ProductBacklogStatus, title: "Done" },
]

interface BoardSectionProps {
    priorityFilters: ProductBacklogPriority[]
    assigneeIdFilters: string[]
}

export default function BoardSection(props: BoardSectionProps) {
    const {
        selectedSprintId,
        selectedSprintBacklogs,
        selectedSprintBacklogsHasMore,
        isLoadMoreSelectedSprintBacklogsLoading,
        loadMoreSelectedSprintBacklogs,
    } = useSprint()

    const [tasks, setTasks] = useState<ProductBacklog[]>([])
    const [activeTask, setActiveTask] = useState<ProductBacklog | null>(null)
    const [backupTasks, setBackupTasks] = useState<ProductBacklog[]>([])

    const [isInitialLoading, setIsInitialLoading] = useState(true)


    const { triggerReorderProductBacklog } = useReorderProductBacklog()
    const { triggerEditBacklogStatus } = useEditBacklogStatus()

    useEffect(() => {
        setIsInitialLoading(true)
        if (selectedSprintId) {
            const currentSprintTasks = selectedSprintBacklogs.filter(
                (backlog) =>
                    (selectedSprintId === "unassigned" && backlog.sprintId === null) ||
                    (selectedSprintId !== "unassigned" && backlog.sprintId === selectedSprintId)
            )
            setTasks(currentSprintTasks)
        } else {
            setTasks([])
        }
        setIsInitialLoading(false)
    }, [selectedSprintId, selectedSprintBacklogs])


    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesPriority =
                props.priorityFilters.length === 0 || props.priorityFilters.includes(task.priority);

            const matchesAssignee =
                props.assigneeIdFilters.length === 0 ||
                (task.assigneeId !== null && props.assigneeIdFilters.includes(task.assigneeId));

            return matchesPriority && matchesAssignee;
        });
    }, [tasks, props.priorityFilters, props.assigneeIdFilters]);


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

    function getTasksByStatus(status: ProductBacklogStatus): ProductBacklog[] {
        return filteredTasks.filter((task) => task.status === status)
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        const activeId = active.id as string
        const task = tasks.find((task) => task.id === activeId)

        if (task) {
            setActiveTask(task)

            const originalContainerValue = task.status
            let insertPosition = -1

            const containerTasks = tasks.filter(
                (t) =>
                    t.status === originalContainerValue &&
                    (selectedSprintId === "unassigned" ? t.sprintId === null : t.sprintId === selectedSprintId),
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

        const isOverContainer = CONTAINERS.some((container) => container.id === overId)

        if (isOverContainer) {
            targetContainer = overId as ProductBacklogStatus
        } else {
            const overTask = tasks.find((task) => task.id === overId)
            if (overTask) {
                targetContainer = overTask.status
            } else {
                targetContainer = dragStateRef.current.originalContainer as ProductBacklogStatus
            }
        }

        dragStateRef.current.currentContainer = targetContainer

        let newInsertPosition = -1
        const targetTasks = tasks.filter(
            (task) =>
                task.status === targetContainer &&
                (selectedSprintId === "unassigned" ? task.sprintId === null : task.sprintId === selectedSprintId),
        )

        if (isOverContainer) {
            newInsertPosition = targetTasks.length
        } else {
            const overTask = tasks.find((task) => task.id === overId)
            if (overTask && overTask.status === targetContainer) {
                const overIndex = targetTasks.findIndex((task) => task.id === overId)
                if (overIndex >= 0) {
                    newInsertPosition = overIndex + 1
                }
            } else {
                newInsertPosition = targetTasks.length
            }
        }

        dragStateRef.current.insertPosition = newInsertPosition

        if (activeTask.status !== targetContainer) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((task) => task.id === activeId)
                const activeTaskCopy = tasks[activeIndex]

                const newTasks = tasks.filter((task) => task.id !== activeId)

                const targetTasksInArray = newTasks.filter(
                    (task) =>
                        task.status === targetContainer &&
                        (selectedSprintId === "unassigned" ? task.sprintId === null : task.sprintId === selectedSprintId),
                )

                let insertIndex = newTasks.length

                if (!isOverContainer) {
                    const overTask = newTasks.find((task) => task.id === overId)
                    if (overTask) {
                        const overIndex = newTasks.findIndex((task) => task.id === overId)
                        insertIndex = overIndex
                    }
                } else {
                    if (targetTasksInArray.length > 0) {
                        const lastTaskIndex = newTasks.lastIndexOf(targetTasksInArray[targetTasksInArray.length - 1])
                        insertIndex = lastTaskIndex + 1
                    } else {
                        const containerIndex = CONTAINERS.findIndex((c) => c.id === targetContainer)
                        let insertPoint = 0

                        for (let i = 0; i < containerIndex; i++) {
                            const prevContainerTasks = newTasks.filter(
                                (task) =>
                                    task.status === CONTAINERS[i].id &&
                                    (selectedSprintId === "unassigned" ? task.sprintId === null : task.sprintId === selectedSprintId),
                            )
                            insertPoint += prevContainerTasks.length
                        }

                        insertIndex = insertPoint
                    }
                }

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
            dragStateRef.current.currentContainer = dragStateRef.current.originalContainer
            dragStateRef.current.insertPosition = dragStateRef.current.originalPosition
            setActiveTask(null)
            return
        }

        const overId = over.id as string
        const activeTask = tasks.find((task) => task.id === activeId)

        if (!activeTask) {
            setActiveTask(null)
            return
        }

        setBackupTasks([...tasks])

        const targetContainer = dragStateRef.current.currentContainer as ProductBacklogStatus

        const hasChanged =
            dragStateRef.current.originalContainer !== dragStateRef.current.currentContainer ||
            dragStateRef.current.originalPosition !== dragStateRef.current.insertPosition

        if (activeTask.status === targetContainer && activeId !== overId) {
            const containerTasks = tasks.filter(
                (task) =>
                    task.status === targetContainer &&
                    (selectedSprintId === "unassigned" ? task.sprintId === null : task.sprintId === selectedSprintId),
            )

            const activeIndex = containerTasks.findIndex((task) => task.id === activeId)
            const overIndex = containerTasks.findIndex((task) => task.id === overId)

            if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                const reorderedTasks = arrayMove(containerTasks, activeIndex, overIndex)

                dragStateRef.current.insertPosition = reorderedTasks.findIndex((task) => task.id === activeId)

                setTasks((tasks) => {
                    const otherTasks = tasks.filter(
                        (task) =>
                            task.status !== targetContainer ||
                            (selectedSprintId === "unassigned" ? task.sprintId !== null : task.sprintId !== selectedSprintId),
                    )

                    const result: ProductBacklog[] = []

                    CONTAINERS.forEach((container) => {
                        if (container.id === targetContainer) {
                            result.push(...reorderedTasks)
                        } else {
                            result.push(...otherTasks.filter((task) => task.status === container.id))
                        }
                    })

                    const nonSprintTasks = tasks.filter((task) =>
                        selectedSprintId === "unassigned" ? task.sprintId !== null : task.sprintId !== selectedSprintId,
                    )
                    result.push(...nonSprintTasks)

                    return result
                })
            }
        }

        if (hasChanged) {
            try {
                const dragState = dragStateRef.current

                toast.success(
                    `Backlog successfully updated from ${dragState.originalContainer} to ${dragState.currentContainer}`,
                )

                await triggerReorderProductBacklog({
                    activeId: dragState.activeId!,
                    originalContainer: selectedSprintId,
                    currentContainer: selectedSprintId,
                    insertPosition: dragState.insertPosition,
                })

                await triggerEditBacklogStatus({
                    backlogId: dragState.activeId!,
                    status: dragState.currentContainer as ProductBacklogStatus,
                })
            } catch (error) {
                console.error("Failed to reorder backlog:", error)

                setTasks(backupTasks)

                dragStateRef.current.currentContainer = dragStateRef.current.originalContainer
                dragStateRef.current.insertPosition = dragStateRef.current.originalPosition

                toast.error(`API Call Failed:\n\n` + `Error: ${error}\n` + `Task has been restored to its original position.`)
            }
        }

        setActiveTask(null)
    }

    const getTaskCount = (status: ProductBacklogStatus) => {
        return getTasksByStatus(status).length
    }

    return (
        <div className="bg-background min-h-screen">
            {isInitialLoading && filteredTasks? (
                <BoardSkeleton columnCount={3} cardCountPerColumn={3} />
            ) : (
                <>
                    <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Loaded Tasks: {tasks.length}</span>
                        <span>Filtered Tasks: {filteredTasks.length}</span>
                        <span>To Do: {getTaskCount("TODO")}</span>
                        <span>In Progress: {getTaskCount("INPROGRESS")}</span>
                        <span>Done: {getTaskCount("DONE")}</span>
                    </div>

                    {/* Empty State */}
                    {filteredTasks.length === 0 && tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
                            <EmptyStateIllustration size="sm" type="no-task"></EmptyStateIllustration>
                        </div>
                    )}

                    {/* Filtered Empty State */}
                    {filteredTasks.length === 0 && tasks.length > 0 && (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
                            <EmptyStateIllustration type="no-task"></EmptyStateIllustration>
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
                            {activeTask && <DragOverlay>{<BacklogCard projectId={selectedSprintId} task={activeTask} isDragging />}</DragOverlay>}
                        </DndContext>
                    )}

                    {/* Load More Button at Bottom */}
                    {selectedSprintBacklogsHasMore && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={() => {
                                    loadMoreSelectedSprintBacklogs()
                                }}
                                disabled={isLoadMoreSelectedSprintBacklogsLoading} variant="outline" size="lg">
                                {isLoadMoreSelectedSprintBacklogsLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading More Tasks...
                                    </>
                                ) : (
                                    `Load More Tasks`
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
