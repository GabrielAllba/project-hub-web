"use client"

import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { cn } from "@/shared/utils/merge-class"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
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
  loadingBacklog: boolean
  isDraggedOver: boolean
  totalElement: number
}

export function DroppableContainerSprint(props: DroppableContainerSprintProps) {
  const { setNodeRef, isOver } = useDroppable({ id: props.sprint.id })
  const isDragActive = isOver || props.isDraggedOver

  return (
    <>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex gap-1 items-center w-full ">
            <div className="flex justify-center items-center gap-2">
              <p className="font-semibold">{props.containerName}</p>
              {props.sprint.startDate && props.sprint.endDate &&
                <div className="flex gap-1 text-xs">
                  <p className="text-gray-700">{new Date(props.sprint.startDate).toDateString()}</p>
                  <span>-</span>
                  <p className="text-gray-700">{new Date(props.sprint.endDate).toDateString()}</p>
                </div>
              }
            </div>
            <EditSprintModal
              sprint={props.sprint}
              onEditSprint={props.onEditSprint}
            />
          </div>
          <p className="text-xs text-gray-500">
            {props.sprint.sprintGoal}
          </p>
        </div>
        <div className="flex items-center gap-2 ">
          <Badge variant="secondary" className="text-xs">
            {props.loadingBacklog ? "..." : props.totalElement}
          </Badge>
          <Button size="sm" variant="outline" className="text-xs rounded" onClick={() => { }}>
            <Plus className="w-4 h-4" />
            Start Sprint
          </Button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "mt-2 rounded-sm transition-all duration-200 border-2 border-dashed min-h-[120px] p-4 flex flex-col",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
        )}
        data-container-id={props.sprint.id}
      >
        <SortableContext
          items={props.items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}>
          <div className="flex flex-col flex-1">
            {props.items.map((item) => (
              <SortableBacklog
                key={item.id}
                id={item.id}
                backlog={item}
                onDeleteBacklog={props.onDeleteBacklog}
                onEditBacklog={props.onEditBacklog}
              />
            ))}
            {props.items.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm min-h-[80px]">
                {isDragActive ? "Drop items here" : "No items in this sprint"}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </>
  )
}