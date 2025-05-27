"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/product-backlog-constants"
import type { ProductBacklogWithContainer } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { useDragAndDropProductBacklog } from "@/shared/hooks/use-drag-and-drop-product-backlog"
import { useGetProductBacklog } from "@/shared/hooks/use-get-product-backlog"
import { getPriorityLabel, getStatusLabel } from "@/shared/utils/product-backlog-utils"
import { DndContext, DragOverlay, pointerWithin, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useEffect, useState } from "react"
import { DroppableContainer } from "../../containers/droppable-container"
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { LoadingSpinner } from "../../ui/loading-spinner"
import { ProductBacklogFilters } from "../filters/product-backlog-filter"
import { SprintContainer } from "../sprint/sprint-container"
import { AddTaskInput } from "./add-product-backlog-input"
import { ProductBacklogItem } from "./product-backlog-item"
import { SortableProductBacklogItem } from "./sortable-product-backlog-item"

interface ProductBacklogSectionProps {
  projectId: string
}

export const ProductBacklogSection = ({ projectId }: ProductBacklogSectionProps) => {
  const [productBacklogs, setProductBacklogs] = useState<ProductBacklogWithContainer[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string>("Semua Prioritas")
  const [statusFilter, setStatusFilter] = useState<string>("Semua Status")
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const {
    triggerGetProductBacklog,
    triggerGetProductBacklogResponse,
    triggerGetProductBacklogLoading,
    triggerGetProductBacklogError,
  } = useGetProductBacklog(projectId)


  const { sensors, activeProductBacklog, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDropProductBacklog(productBacklogs, setProductBacklogs)

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((response) => {
          if (response.status === "success" && response.data) {
            const backlogItems = response.data.content.map((item) => ({
              ...item,
              containerId: "backlog",
            }))
            setProductBacklogs(backlogItems)

          }
        })

        setIsInitialLoad(false)
      } catch (error) {
        console.error("Failed to load product backlog:", error)
        setIsInitialLoad(false)
      }
    }

    if (projectId) {
      loadInitialData()
    }
  }, [projectId])

  const addSprint = () => {
    const newSprintNumber = sprints.length + 1
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      title: `Sprint ${newSprintNumber}`,
      description: `Sprint ${newSprintNumber}: Fokus pada tugas prioritas tinggi`,
      isCollapsed: false,
    }
    setSprints((prev) => [...prev, newSprint])
  }

  const toggleSprintCollapse = (sprintId: string) => {
    setSprints((prev) =>
      prev.map((sprint) => (sprint.id === sprintId ? { ...sprint, isCollapsed: !sprint.isCollapsed } : sprint)),
    )
  }

  const getProductBacklogsByContainer = (containerId: string) => {
    return productBacklogs.filter((productBacklog) => productBacklog.containerId === containerId)
  }

  const getFilteredProductBacklog = () => {
    const productBacklogs = getProductBacklogsByContainer("backlog")
    return productBacklogs.filter((productBacklog) => {
      const matchPriority =
        priorityFilter !== "Semua Prioritas" ? getPriorityLabel(productBacklog.priority) === priorityFilter : true
      const matchStatus = statusFilter !== "Semua Status" ? getStatusLabel(productBacklog.status) === statusFilter : true
      return matchPriority && matchStatus
    })
  }

  const loadMoreProductBacklogs = async () => {
    if (triggerGetProductBacklogResponse?.data && !triggerGetProductBacklogResponse.data.last) {
      try {
        const nextPage = currentPage + 1
        await triggerGetProductBacklog(nextPage, DEFAULT_PAGE_SIZE)
        setCurrentPage(nextPage)
      } catch (error) {
        console.error("Failed to load more product backlogs:", error)
      }
    }
  }

  if (isInitialLoad && triggerGetProductBacklogLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-muted-foreground">Loading backlog...</span>
      </div>
    )
  }

  if (triggerGetProductBacklogError || triggerGetProductBacklogResponse?.status === "error") {
    return (
      <p>
        Failed to load product backlog. {triggerGetProductBacklogResponse?.message || "Please try again."}
      </p>

    )
  }

  const handleTaskCreated = async () => {
    try {
      const response = await triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
      if (response.status === "success" && response.data) {
        const backlogItems = response.data.content.map((item) => ({
          ...item,
          containerId: "backlog",
        }));
        setProductBacklogs(backlogItems);
        setCurrentPage(DEFAULT_PAGE);
      }
    } catch (error) {
      console.error("Failed to refresh product backlog:", error);
    }
  };

  const handleDropBacklog = (event: DragEndEvent) => {
    handleDragEnd(event)
  }

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDropBacklog}
      >
        {sprints.map((sprint) => (
          <SprintContainer
            key={sprint.id}
            sprint={sprint}
            productBacklogs={getProductBacklogsByContainer(sprint.id)}
            onToggleCollapse={toggleSprintCollapse}
          />
        ))}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg font-semibold">Backlog</CardTitle>
              {triggerGetProductBacklogResponse?.data && (
                <span className="text-sm text-muted-foreground">
                  {triggerGetProductBacklogResponse.data.totalElements} total product backlogs
                </span>
              )}
            </div>
            <Button size="sm" onClick={addSprint}>
              Buat sprint
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductBacklogFilters
              priorityFilter={priorityFilter}
              statusFilter={statusFilter}
              onPriorityChange={setPriorityFilter}
              onStatusChange={setStatusFilter}
            />

            <DroppableContainer containerId="backlog">
              <SortableContext
                items={getFilteredProductBacklog().map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {getFilteredProductBacklog().map((productBacklog) => (
                    <SortableProductBacklogItem key={productBacklog.id} productBacklog={productBacklog} />
                  ))}

                  {getFilteredProductBacklog().length === 0 && !triggerGetProductBacklogLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No product backlogs found matching the current filters.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DroppableContainer>

            {triggerGetProductBacklogResponse?.data && !triggerGetProductBacklogResponse.data.last && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMoreProductBacklogs} disabled={triggerGetProductBacklogLoading}>
                  {triggerGetProductBacklogLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More Product Backlogs"
                  )}
                </Button>
              </div>
            )}
            <div className="pt-4 border-t">
              <AddTaskInput projectId={projectId} onTaskCreated={handleTaskCreated} />
            </div>
          </CardContent>
        </Card>

        <DragOverlay>{activeProductBacklog ? <ProductBacklogItem productBacklog={activeProductBacklog} isDragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}
