"use client"

import { DroppableContainerProductBacklog } from "@/presentation/components/containers/droppable-container-product-backlog"
import { DroppableContainerSprint } from "@/presentation/components/containers/droppable-container-sprint"
import { useBacklog } from "@/shared/contexts/backlog-context"
import { useDragState } from "@/shared/contexts/drag-state-context"
import { useSprint } from "@/shared/contexts/sprint-context"
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
import { AddProductBacklogInput } from "../input/add-product-backlog-input"
import { BacklogItem } from "../items/backlog-item"
import { BacklogSkeleton } from "../loading/backlog-skeleton"
import { Button } from "../ui/button"
import { useState } from "react"

export default function ListSection() {
    const {
        unassignedBacklogs,
        totalUnassigned,
        loadingUnassigned,
        hasMoreUnassigned,
        loadMoreBacklogs,
        removeBacklogItem,
        insertBacklogItemAt,
    } = useBacklog()

    const {
        sprints,
        loadingSprints,
        sprintBacklogs,
        removeSprintBacklogItem,
        insertSprintBacklogItemAt,
    } = useSprint()

    const {
        dragState,
        setDragState,
        dragOverContainer,
        setDragOverContainer,
        resetDragState,
    } = useDragState()

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    )

    const getAllItems = () => [
        ...unassignedBacklogs,
        ...Object.values(sprintBacklogs).flat(),
    ]

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const activeId = active.id as string

        const foundInSprint = sprints.find((s) =>
            (sprintBacklogs[s.id] || []).some((item) => item.id === activeId)
        )
        const foundInBacklog = unassignedBacklogs.some((item) => item.id === activeId)

        let originalContainer: string | null = null
        let originalPos = -1

        if (foundInSprint) {
            originalContainer = foundInSprint.id
            const list = sprintBacklogs[originalContainer] || []
            originalPos = list.findIndex((item) => item.id === activeId)
        } else if (foundInBacklog) {
            originalContainer = "backlog"
            originalPos = unassignedBacklogs.findIndex((item) => item.id === activeId)
        }

        setDragState({
            activeId,
            originalContainer,
            currentContainer: originalContainer,
            insertPosition: originalPos,
            originalPosition: originalPos,
        })
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) {
            setDragOverContainer(null)
            setDragState((prev) => ({ ...prev, currentContainer: prev.originalContainer }))
            return
        }

        const activeId = active.id as string
        const overId = over.id as string
        const allItems = getAllItems()

        const activeItem = allItems.find((item) => item.id === activeId)
        if (!activeItem) return

        let targetContainer: string | null = null

        const isOverBacklog = overId === "backlog"
        const isOverSprint = sprints.some((sprint) => sprint.id === overId)

        if (isOverBacklog) {
            targetContainer = "backlog"
        } else if (isOverSprint) {
            targetContainer = overId
        } else {
            const overItem = allItems.find((item) => item.id === overId)
            if (overItem) {
                targetContainer = overItem.sprintId || "backlog"
            } else {
                targetContainer = dragState.originalContainer
            }
        }

        setDragOverContainer(targetContainer)
        setDragState((prev) => ({ ...prev, currentContainer: targetContainer }))

        let newInsertPosition = -1
        const targetItems = targetContainer === "backlog"
            ? unassignedBacklogs
            : sprintBacklogs[targetContainer!] || []

        const overItem = allItems.find((item) => item.id === overId)
        if (overItem && (overItem.sprintId || "backlog") === targetContainer) {
            const overIndex = targetItems.findIndex((item) => item.id === overId)
            if (overIndex >= 0) {
                newInsertPosition = overIndex + 1
            }
        } else if (isOverBacklog || isOverSprint) {
            newInsertPosition = targetItems.length
        }

        setDragState((prev) => ({ ...prev, insertPosition: newInsertPosition }))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        if (dragState.insertPosition != 0) {
            dragState.insertPosition--
        }
        const { active, over } = event
        const activeId = active.id as string

        setDragOverContainer(null)

        if (!over) {
            resetDragState()
            return
        }

        const targetContainer = dragState.currentContainer
        const originalContainer = dragState.originalContainer

        if (!targetContainer || originalContainer === null) {
            resetDragState()
            return
        }

        const allItems = getAllItems()
        const activeItem = allItems.find((item) => item.id === activeId)
        if (!activeItem) {
            resetDragState()
            return
        }

        const newItem = {
            ...activeItem,
            sprintId: targetContainer === "backlog" ? null : targetContainer,
        }

        if (originalContainer === "backlog") {
            removeBacklogItem(activeId)
        } else {
            removeSprintBacklogItem(originalContainer, activeId)
        }

        if (targetContainer === "backlog") {
            insertBacklogItemAt(newItem, dragState.insertPosition)
        } else {
            insertSprintBacklogItemAt(targetContainer, newItem, dragState.insertPosition)
        }
        resetDragState()
    }

    const [clickLoadMore, setClickLoadMore] = useState<boolean>(false)

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

                    {!loadingSprints ? sprints.map((sprint) => (
                        <div className="p-4 rounded-sm border border-gray-200 bg-gray-50 transition-colors">
                            <DroppableContainerSprint
                                key={sprint.id}
                                sprint={sprint}
                                isDraggedOver={dragOverContainer === sprint.id}
                            />
                        </div>
                    )) : (
                        <div className="p-4 space-y-2 rounded-sm border border-gray-200 bg-gray-50 transition-colors">
                            <BacklogSkeleton></BacklogSkeleton>
                            <BacklogSkeleton></BacklogSkeleton>
                            <BacklogSkeleton></BacklogSkeleton>
                            <BacklogSkeleton></BacklogSkeleton>
                        </div>
                    )}

                    <div className="p-4 rounded-sm border border-gray-200 bg-gray-50 transition-colors">
                        {loadingUnassigned ? (
                            <div className="space-y-2">
                                <BacklogSkeleton></BacklogSkeleton>
                                <BacklogSkeleton></BacklogSkeleton>
                                <BacklogSkeleton></BacklogSkeleton>
                                <BacklogSkeleton></BacklogSkeleton>
                            </div>
                        ) : (
                            <DroppableContainerProductBacklog
                                id="backlog"
                                items={unassignedBacklogs}
                                loadingUnassigned={loadingUnassigned}
                                totalElement={totalUnassigned}
                                isDraggedOver={dragOverContainer === "backlog"}
                            />
                        )}

                        {!loadingUnassigned && <AddProductBacklogInput />}

                        {hasMoreUnassigned && (
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    setClickLoadMore(true)
                                    await loadMoreBacklogs()
                                    setClickLoadMore(false)
                                }}
                                disabled={clickLoadMore || loadingUnassigned}
                                className="flex mx-auto mt-2"
                            >
                                Load More Product Backlogs
                            </Button>
                        )}
                    </div>
                    <DragOverlay>
                        {dragState.activeId && (() => {
                            const allItems = getAllItems()
                            const draggedItem = allItems.find(item => item.id === dragState.activeId)
                            return draggedItem ? <BacklogItem backlog={draggedItem} /> : null
                        })()}
                    </DragOverlay>
                </DndContext>
            </div>
        </main>
    )
}