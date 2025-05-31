"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/product-backlog-constants"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { useGetProductBacklog } from "@/shared/hooks/use-get-product-backlog"
import { useGetProductBacklogBySprint } from "@/shared/hooks/use-get-product-backlog-by-sprint"
import { useGetProjectSprints } from "@/shared/hooks/use-get-project-sprints"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useEffect, useState } from 'react'
import { AddProductBacklogInput } from "./add-product-backlog-input"
import { ProductBacklogContainer } from "./product-backlog-container"
import { ProductBacklogItem } from "./product-backlog-item"
import { SortableContainer } from "./sortable-container"

interface Props {
  projectId: string
}

export default function ProductBacklogSection({ projectId }: Props) {
  // State for sprints
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [sprintsLoading, setSprintsLoading] = useState(true)

  // State for unassigned backlog items
  const [unassignedBacklog, setUnassignedBacklog] = useState<ProductBacklog[]>([])
  const [unassignedLoading, setUnassignedLoading] = useState(true)

  // State for sprint backlog items - maps sprint ID to its items
  const [sprintBacklogItems, setSprintBacklogItems] = useState<Record<string, ProductBacklog[]>>({})
  const [sprintItemsLoading, setSprintItemsLoading] = useState<Record<string, boolean>>({})

  const {
    triggerGetProductBacklog
  } = useGetProductBacklog(projectId)

  const {
    triggerGetProjectSprints
  } = useGetProjectSprints(projectId)

  const {
    triggerGetProductBacklogBySprint
  } = useGetProductBacklogBySprint("")

  // State for active drag item
  const [activeItem, setActiveItem] = useState<ProductBacklog | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )


  // Load data
  useEffect(() => {
    const loadData = async () => {
      // Fetch sprints
      setSprintsLoading(true)
      try {
        triggerGetProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {
          setSprints(res.data.content)
          // Initialize loading state for each sprint
          const loadingState: Record<string, boolean> = {}
          res.data.content.forEach((sprint) => {
            loadingState[sprint.id] = true
          })
          setSprintItemsLoading(loadingState)
          // Fetch backlog items for each sprint
          const sprintItems: Record<string, ProductBacklog[]> = {}
          for (const sprint of res.data.content) {
            triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {

              sprintItems[sprint.id] = res.data.content
              setSprintItemsLoading((prev) => ({ ...prev, [sprint.id]: false }))
              // Update state immediately for each sprint
              setSprintBacklogItems((prev) => ({ ...prev, [sprint.id]: res.data.content }))
            })
          }
        })


      } catch (error) {
        console.error("Error fetching sprints:", error)
      } finally {
        setSprintsLoading(false)
      }

      // Fetch unassigned backlog items
      setUnassignedLoading(true)
      try {
        triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {
          setUnassignedBacklog(res.data.content)
        })
      } catch (error) {
        console.error("Error fetching unassigned backlog:", error)
      } finally {
        setUnassignedLoading(false)
      }
    }

    loadData()
  }, [projectId])

  // Helper function to find an item by ID
  const findItemById = (itemId: string): [ProductBacklog | undefined, string | null] => {
    // Check unassigned backlog
    const unassignedItem = unassignedBacklog.find((item) => item.id === itemId)
    if (unassignedItem) return [unassignedItem, null]

    // Check sprint backlog items
    for (const sprintId in sprintBacklogItems) {
      const item = sprintBacklogItems[sprintId].find((item) => item.id === itemId)
      if (item) return [item, sprintId]
    }

    return [undefined, null]
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string
    const [item] = findItemById(activeId)
    setActiveItem(item || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const [activeItem, activeSprintId] = findItemById(activeId)
    if (!activeItem) return

    // Check if dropping on product backlog container
    if (overId === "product-backlog") {
      if (activeSprintId !== null) {
        // Move from sprint to unassigned
        setSprintBacklogItems((prev) => ({
          ...prev,
          [activeSprintId]: prev[activeSprintId].filter((item) => item.id !== activeId),
        }))
        setUnassignedBacklog((prev) => [...prev, { ...activeItem, sprintId: null }])
      }
      return
    }

    // Check if dropping on a sprint container
    const targetSprint = sprints.find((sprint) => sprint.id === overId)
    if (targetSprint) {
      if (activeSprintId !== targetSprint.id) {
        // Move from current location to target sprint
        if (activeSprintId === null) {
          // From unassigned to sprint
          setUnassignedBacklog((prev) => prev.filter((item) => item.id !== activeId))
          setSprintBacklogItems((prev) => ({
            ...prev,
            [targetSprint.id]: [...(prev[targetSprint.id] || []), { ...activeItem, sprintId: targetSprint.id }],
          }))
        } else {
          // From one sprint to another
          setSprintBacklogItems((prev) => ({
            ...prev,
            [activeSprintId]: (prev[activeSprintId] || []).filter((item) => item.id !== activeId),
            [targetSprint.id]: [...(prev[targetSprint.id] || []), { ...activeItem, sprintId: targetSprint.id }],
          }))
        }
      }
      return
    }

    // Check if dropping on another item
    const [overItem, overSprintId] = findItemById(overId)
    if (!overItem) return

    if (activeSprintId !== overSprintId) {
      // Move from current location to target location
      if (activeSprintId === null) {
        // From unassigned to sprint
        setUnassignedBacklog((prev) => prev.filter((item) => item.id !== activeId))
        setSprintBacklogItems((prev) => ({
          ...prev,
          [overSprintId as string]: [
            ...(prev[overSprintId as string] || []),
            { ...activeItem, sprintId: overSprintId },
          ],
        }))
      } else if (overSprintId === null) {
        // From sprint to unassigned
        setSprintBacklogItems((prev) => ({
          ...prev,
          [activeSprintId]: (prev[activeSprintId] || []).filter((item) => item.id !== activeId),
        }))
        setUnassignedBacklog((prev) => [...prev, { ...activeItem, sprintId: null }])
      } else {
        // From one sprint to another
        setSprintBacklogItems((prev) => ({
          ...prev,
          [activeSprintId]: (prev[activeSprintId] || []).filter((item) => item.id !== activeId),
          [overSprintId]: [...(prev[overSprintId] || []), { ...activeItem, sprintId: overSprintId }],
        }))
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveItem(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const [activeItem, activeSprintId] = findItemById(activeId)
    const [overItem, overSprintId] = findItemById(overId)

    if (!activeItem || activeId === overId) {
      setActiveItem(null)
      return
    }

    // Only reorder if items are in the same container and not the same item
    if (activeSprintId === overSprintId && overItem) {
      if (activeSprintId === null) {
        // Reorder within unassigned backlog
        const activeIndex = unassignedBacklog.findIndex((item) => item.id === activeId)
        const overIndex = unassignedBacklog.findIndex((item) => item.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
          const reorderedItems = arrayMove([...unassignedBacklog], activeIndex, overIndex)
          setUnassignedBacklog(reorderedItems)
        }
      } else {
        // Reorder within a sprint
        const sprintItems = sprintBacklogItems[activeSprintId]
        const activeIndex = sprintItems.findIndex((item) => item.id === activeId)
        const overIndex = sprintItems.findIndex((item) => item.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
          const reorderedItems = arrayMove([...sprintItems], activeIndex, overIndex)
          setSprintBacklogItems((prev) => ({
            ...prev,
            [activeSprintId]: reorderedItems,
          }))
        }
      }
    }

    setActiveItem(null)
  }

  const handleProductBacklogCreated = async () => {
    try {
      triggerGetProductBacklog(DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {
        setUnassignedBacklog(res.data.content)
      })
    } catch (error) {
      console.error("Failed to refresh product backlog:", error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Sprint Sections */}
        {sprintsLoading ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-sm text-gray-500">Loading sprints...</p>
          </div>
        ) : (
          sprints.map((sprint) => (
            <SortableContainer
              key={sprint.id}
              sprint={sprint}
              items={sprintBacklogItems[sprint.id] || []}
              isLoading={sprintItemsLoading[sprint.id] || false}
            />
          ))
        )}

        {/* Product Backlog Section */}
        <div>
          <ProductBacklogContainer
            items={unassignedBacklog}
            isLoading={unassignedLoading} />
          <div className="pt-4 border-t">
            <AddProductBacklogInput
              projectId={projectId}
              onProductBacklogCreated={handleProductBacklogCreated} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <ProductBacklogItem backlog={activeItem}></ProductBacklogItem>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
