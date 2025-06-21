"use client"

import type { BaseResponse } from "@/domain/dto/base-response"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { useStartSprint } from "@/shared/hooks/use-start-sprint"
import { cn } from "@/shared/utils/merge-class"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { EmptyStateIllustration } from "../empty/empty-state"
import { CompleteSprintModal } from "../modal/complete-sprint-modal"
import { EditSprintModal } from "../modal/edit-sprint-modal"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { SortableBacklog } from "./sortable-backlog"

interface DroppableContainerSprintProps {
  containerName: string
  sprint: Sprint
  items: ProductBacklog[]
  onDeleteBacklog: (backlog: ProductBacklog) => void
  onEditSprint: (sprintId: string) => void
  onEditBacklog: (backlogId: string) => void
  onCompleteSprint: () => void
  loadingBacklog: boolean
  isDraggedOver: boolean
  totalElement: number
}

export function DroppableContainerSprint(props: DroppableContainerSprintProps) {
  const { setNodeRef, isOver } = useDroppable({ id: props.sprint.id })
  const isDragActive = isOver || props.isDraggedOver

  const { triggerStartSprint } = useStartSprint(props.sprint.id)

  const handleStartSprint = async () => {
    try {
      await triggerStartSprint()
      props.onEditSprint(props.sprint.id)
    } catch (error) {
      const baseError = error as BaseResponse<null>
      toast.error(baseError.message)

    }
  }

  const isSprintStarted = props.sprint.status === "IN_PROGRESS"

  return (
    <>
      <div
        className={cn(
          "flex justify-between items-start px-3 py-2 rounded-t",
          isSprintStarted ? "bg-blue-50 border-l-4 border-blue-500" : ""
        )}
      >
        {/* Left: Sprint title, date, goal */}
        <div className="flex flex-col">
          <div className="flex gap-2 items-center flex-wrap">
            <p className="font-semibold text-sm">{props.containerName}</p>
            {props.sprint.startDate && props.sprint.endDate && (
              <div className="flex gap-1 text-xs text-gray-700">
                <p>{new Date(props.sprint.startDate).toDateString()}</p>
                <span>-</span>
                <p>{new Date(props.sprint.endDate).toDateString()}</p>
              </div>
            )}
            <EditSprintModal sprint={props.sprint} onEditSprint={props.onEditSprint} />
          </div>
          <p className="text-xs text-gray-500 italic mt-1">
            {props.sprint.sprintGoal}
          </p>
        </div>

        {/* Right: Status + actions */}
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
            {props.loadingBacklog ? "..." : props.totalElement}
          </Badge>

          {isSprintStarted ? (
            <CompleteSprintModal
              sprintId={props.sprint.id}
              sprintName={props.containerName}
              availableSprints={[
                { id: "backlog", name: "Backlog" }
              ]}
              onCompleteSprint={(moveToSprintId) => {
                console.log(moveToSprintId)
                props.onCompleteSprint()
              }}
            />

          ) : (
            <Button
              onClick={handleStartSprint}
              disabled={props.totalElement === 0 || props.loadingBacklog}
              size="sm"
              variant="outline"
              className={cn(
                "hover:cursor-pointer text-xs rounded flex items-center gap-1",
                props.totalElement === 0 || props.loadingBacklog ? "opacity-60 cursor-not-allowed" : ""
              )}
            >
              <Plus className="w-4 h-4" />
              Start Sprint
            </Button>
          )}
        </div>
      </div>


      <div
        ref={setNodeRef}
        className={cn(
          "mt-0 rounded-b-md transition-all duration-200 border-2 border-dashed min-h-[120px] p-4 flex flex-col",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
        )}
        data-container-id={props.sprint.id}
      >
        {
          !props.loadingBacklog && <SortableContext
            items={props.items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col flex-1">
              {props.items.map((item) => (
                <SortableBacklog
                  key={item.id}
                  backlog={item}
                  onDeleteBacklog={props.onDeleteBacklog}
                  onEditBacklog={props.onEditBacklog}
                />
              ))}
              {props.items.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm min-h-[80px]">
                  {isDragActive ? "Drop items here" :
                    <EmptyStateIllustration size="sm" type="no-task"></EmptyStateIllustration>}
                </div>
              )}
            </div>
          </SortableContext>
        }

      </div>
    </>

  )
}
