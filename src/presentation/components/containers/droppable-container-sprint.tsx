"use client"

import type { Sprint } from "@/domain/entities/sprint"
import { useSprint } from "@/shared/contexts/sprint-context"
import { cn } from "@/shared/utils/merge-class"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronDown, ChevronRight, Plus } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { EmptyStateIllustration } from "../empty/empty-state"
import { AddProductBacklogInput } from "../input/add-product-backlog-input"
import { LoadingSpinner } from "../loading/loading-spinner"
import { CompleteSprintModal } from "../modal/complete-sprint-modal"
import { EditSprintModal } from "../modal/edit-sprint-modal"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { SortableBacklog } from "./sortable-backlog"

interface DroppableContainerSprintProps {
  sprint: Sprint
  isDraggedOver: boolean
}

export function DroppableContainerSprint({ sprint, isDraggedOver }: DroppableContainerSprintProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: sprint.id })
  const isDragActive = isOver || isDraggedOver

  const {
    startSprint,
    sprintBacklogs,
    sprintTotalItems,
    loadingSprintBacklogs,
    loadMoreSprintBacklogs,
    sprintHasMore,
  } = useSprint()

  const handleStartSprint = async () => {
    try {
      await startSprint(sprint.id)
    } catch (error) {
      toast.error("Start sprint failed: " + error)
    }
  }

  const items = sprintBacklogs[sprint.id] || []
  const total = sprintTotalItems[sprint.id] ?? 0
  const isLoadingBacklogsForThisSprint = loadingSprintBacklogs[sprint.id] ?? false
  const isSprintStarted = sprint.status === "IN_PROGRESS"
  const isInitialLoading = items.length === 0 && isLoadingBacklogsForThisSprint

  return (
    <>
      <div className={cn(
        "flex justify-between items-center rounded-t cursor-pointer",
        isSprintStarted ? "bg-blue-50 border-l-4 p-2 border-blue-500" : ""
      )}>
        <div className="flex gap-2 items-center w-full" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4  text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}

          <div className="flex flex-col flex-1 justify-center">
            <div className="flex gap-2 items-center flex-wrap">
              <p className="font-semibold text-sm">{sprint.name}</p>
              <div className="flex gap-1 text-xs text-gray-700">
                {sprint.startDate && <p>{new Date(sprint.startDate).toDateString()} - </p>}
                {sprint.endDate && <p>{new Date(sprint.endDate).toDateString()}</p>}
              </div>
              <EditSprintModal sprint={sprint} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{sprint.sprintGoal}</p>
          </div>

          <div className="flex items-center gap-3">
            {isSprintStarted && (
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                In Progress
              </div>
            )}
            <Badge variant="secondary" className="text-xs">
              {isLoadingBacklogsForThisSprint ? "..." : total}
            </Badge>
            {isSprintStarted ? (
              <CompleteSprintModal sprintId={sprint.id} />
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartSprint()
                }}
                disabled={total === 0 || isLoadingBacklogsForThisSprint}
                size="sm"
                variant="outline"
                className={cn(
                  "hover:cursor-pointer text-xs rounded flex items-center gap-1",
                  total === 0 || isLoadingBacklogsForThisSprint ? "opacity-60 cursor-not-allowed" : ""
                )}
              >
                <Plus className="w-4 h-4" />
                Start Sprint
              </Button>
            )}
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div
            ref={setNodeRef}
            className={cn(
              "mt-0 rounded-b-md transition-all duration-200 border-2 border-dashed min-h-[120px] p-4 mt-2 flex flex-col",
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
            )}
            data-container-id={sprint.id}
          >
            {isInitialLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm min-h-[80px]">
                <LoadingSpinner message="" />
              </div>
            ) : (
              <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col flex-1">
                  {items.map((item) => (
                    <SortableBacklog key={"sortable-backlog" + item.id} backlog={item} />
                  ))}
                  {items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm min-h-[80px]">
                      <EmptyStateIllustration size="sm" type="no-task" />
                    </div>
                  )}
                </div>
              </SortableContext>
            )}
          </div>

          {!isInitialLoading && <AddProductBacklogInput sprintId={sprint.id} />}

          {sprintHasMore[sprint.id] && (
            <Button
              variant="outline"
              onClick={() => loadMoreSprintBacklogs(sprint.id)}
              disabled={isLoadingBacklogsForThisSprint}
              className="flex mx-auto mt-2"
            >
              {isLoadingBacklogsForThisSprint ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner message="" />
                </span>
              ) : (
                "Load More Product Backlogs"
              )}
            </Button>
          )}
        </>
      )}
    </>
  )
}
