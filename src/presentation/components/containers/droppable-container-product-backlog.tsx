"use client"

import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { EmptyStateIllustration } from "../empty/empty-state"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { SortableBacklog } from "./sortable-backlog"

interface DroppableContainerProductBacklogProps {
  id: string
  items: ProductBacklog[]
  onDeleteBacklog: (backlog: ProductBacklog) => void
  loadingUnassigned: boolean
  totalElement: number
  onCreateSprint: () => void
  onEditBacklogPoint: (backlogId: string) => void
  isDraggedOver: boolean
}

export function DroppableContainerProductBacklog(props: DroppableContainerProductBacklogProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: props.id,
  })

  const isDragActive = isOver || props.isDraggedOver

  return (
    <>
      <div className="flex justify-between">
        <h2 className="font-semibold mb-3">Product Backlog</h2>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {props.loadingUnassigned ? "..." : props.totalElement}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="text-xs rounded hover:cursor-pointer"
            onClick={props.onCreateSprint}
          >
            <Plus />
            Create sprint
          </Button>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`rounded-sm transition-all duration-200 border-2 border-dashed min-h-[120px] p-4 flex flex-col
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
        data-container-id={props.id}
      >
        <SortableContext items={props.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col flex-1">
            {props.items.map((item) => (
              <SortableBacklog
                key={item.id}
                backlog={item}
                onDeleteBacklog={props.onDeleteBacklog}
                onEditBacklog={props.onEditBacklogPoint}
              />
            ))}
            {/* Empty state */}
            {props.items.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm min-h-[80px]">
                {isDragActive ? "Drop items here" : <EmptyStateIllustration size="sm" type="no-task"></EmptyStateIllustration>}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </>
  )
}