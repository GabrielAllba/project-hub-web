"use client"

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"

// Types
interface Backlog {
  id: string
  sprintId: string | null
  content: string
  type: "task" | "bug" | "feature"
}

interface Container {
  id: string
  title: string
}

// Sample data
const initialContainers: Container[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
]

const initialBacklogItems: Backlog[] = [
  { id: "1", sprintId: "todo", content: "Design user interface", type: "task" },
  { id: "2", sprintId: "todo", content: "Fix login bug", type: "bug" },
  { id: "3", sprintId: "todo", content: "Add dark mode", type: "feature" },
  { id: "4", sprintId: "inprogress", content: "Implement authentication", type: "task" },
  { id: "5", sprintId: "inprogress", content: "Database optimization", type: "feature" },
  { id: "6", sprintId: "review", content: "Code review for API", type: "task" },
  { id: "7", sprintId: "done", content: "Setup project structure", type: "task" },
  { id: "8", sprintId: "done", content: "Configure CI/CD", type: "feature" },
]

// Sortable Item Component
function SortableItem({ item }: { item: Backlog }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getTypeColor = (type: Backlog["type"]) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "bug":
        return "bg-red-100 text-red-800 border-red-200"
      case "feature":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
      {...attributes}
      {...listeners}
    >
      <Card className="mb-2 hover:shadow-md transition-shadow rounded-sm">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-2">{item.content}</p>
              <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                {item.type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Container Component
function SortableContainer({ container, items }: { container: Container; items: Backlog[] }) {
  return (
    <Card className="w-full rounded-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{container.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[100px] space-y-0">
            {items.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="flex items-center justify-center h-20 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Drop items here
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}

// Main Component
interface Props {
  projectId: string
}

export default function ProductBacklogSection({ projectId }: Props) {
  const [containers, setContainers] = useState<Container[]>(initialContainers)
  const [backlogItems, setBacklogItems] = useState<Backlog[]>(initialBacklogItems)
  const [activeItem, setActiveItem] = useState<Backlog | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const getItemsForContainer = (containerId: string) => {
    return backlogItems.filter((item) => item.sprintId === containerId)
  }

  const findContainerForItem = (itemId: string) => {
    const item = backlogItems.find((item) => item.id === itemId)
    return item ? item.sprintId : null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = backlogItems.find((item) => item.id === active.id)
    setActiveItem(item || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if the over element is a container
    const isOverContainer = containers.some((container) => container.id === overId)

    if (isOverContainer) {
      const activeItem = backlogItems.find((item) => item.id === activeId)
      if (activeItem && activeItem.sprintId !== overId) {
        setBacklogItems((items) => items.map((item) => (item.id === activeId ? { ...item, sprintId: overId } : item)))
      }
      return
    }

    // Find the containers for both items
    const activeItem = backlogItems.find((item) => item.id === activeId)
    const overItem = backlogItems.find((item) => item.id === overId)

    if (!activeItem || !overItem) return

    const activeContainerId = activeItem.sprintId
    const overContainerId = overItem.sprintId

    if (activeContainerId !== overContainerId) {
      setBacklogItems((items) =>
        items.map((item) => (item.id === activeId ? { ...item, sprintId: overContainerId } : item)),
      )
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

    // Check if the item is being dropped on a container
    const isOverContainer = containers.some((container) => container.id === overId)

    if (isOverContainer) {
      // Item is being dropped directly on a container
      setBacklogItems((items) => items.map((item) => (item.id === activeId ? { ...item, sprintId: overId } : item)))
      setActiveItem(null)
      return
    }

    // Find the containers for both items
    const activeItem = backlogItems.find((item) => item.id === activeId)
    const overItem = backlogItems.find((item) => item.id === overId)

    if (!activeItem || !overItem) {
      setActiveItem(null)
      return
    }

    const activeContainerId = activeItem.sprintId
    const overContainerId = overItem.sprintId

    if (activeContainerId !== overContainerId) {
      // Moving between containers
      setBacklogItems((items) =>
        items.map((item) => (item.id === activeId ? { ...item, sprintId: overContainerId } : item)),
      )
    } else if (activeId !== overId) {
      // Reordering within the same container
      const containerItems = getItemsForContainer(activeContainerId as string)
      const activeIndex = containerItems.findIndex((item) => item.id === activeId)
      const overIndex = containerItems.findIndex((item) => item.id === overId)

      if (activeIndex !== -1 && overIndex !== -1) {
        // Create a new array with the reordered items
        const reorderedItems = arrayMove([...containerItems], activeIndex, overIndex)

        // Create a new array with all items, replacing the ones in the affected container
        const newItems = backlogItems.filter((item) => item.sprintId !== activeContainerId)

        // Add the reordered items
        setBacklogItems([...newItems, ...reorderedItems])
      }
    }

    setActiveItem(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {containers.map((container) => (
          <SortableContainer key={container.id} container={container} items={getItemsForContainer(container.id)} />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-2">{activeItem.content}</p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      activeItem.type === "task"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : activeItem.type === "bug"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-green-100 text-green-800 border-green-200"
                    }`}
                  >
                    {activeItem.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
