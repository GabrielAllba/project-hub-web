"use client"

import type { ProductBacklogWithContainer } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronDown, ChevronRight } from "lucide-react"
import { DroppableContainer } from "../../containers/droppable-container"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { SortableProductBacklogItem } from "../product-backlog/sortable-product-backlog-item"

interface SprintContainerProps {
  sprint: Sprint
  productBacklogs: ProductBacklogWithContainer[]
  onToggleCollapse: (sprintId: string) => void
}

export const SprintContainer = ({ sprint, productBacklogs, onToggleCollapse }: SprintContainerProps) => {
  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 pb-4 cursor-pointer"
        onClick={() => onToggleCollapse(sprint.id)}
      >
        <div className="flex items-center gap-2">
          {sprint.isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <CardTitle className="text-lg font-semibold">{sprint.name}</CardTitle>
          <Badge variant="secondary">{productBacklogs.length} tugas</Badge>
        </div>
      </CardHeader>
      {!sprint.isCollapsed && (
        <CardContent>
          <DroppableContainer containerId={sprint.id}>
            <SortableContext items={productBacklogs.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {productBacklogs.map((productBacklog) => (
                  <SortableProductBacklogItem key={productBacklog.id} productBacklog={productBacklog} />
                ))}
                {productBacklogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Seret tugas dari backlog ke sini
                  </div>
                )}
              </div>
            </SortableContext>
          </DroppableContainer>
        </CardContent>
      )}
    </Card>
  )
}
