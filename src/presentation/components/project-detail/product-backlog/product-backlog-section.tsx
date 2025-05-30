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
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"


// Types
interface Item {
  id: string
  content: string
  type: "task" | "bug" | "feature"
}

interface Container {
  id: string
  title: string
  items: Item[]
}

// Sample data
const initialContainers: Container[] = [
  {
    id: "todo",
    title: "To Do",
    items: [
      { id: "1", content: "Design user interface", type: "task" },
      { id: "2", content: "Fix login bug", type: "bug" },
      { id: "3", content: "Add dark mode", type: "feature" },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    items: [
      { id: "4", content: "Implement authentication", type: "task" },
      { id: "5", content: "Database optimization", type: "feature" },
    ],
  },
  {
    id: "review",
    title: "Review",
    items: [{ id: "6", content: "Code review for API", type: "task" }],
  },
  {
    id: "done",
    title: "Done",
    items: [
      { id: "7", content: "Setup project structure", type: "task" },
      { id: "8", content: "Configure CI/CD", type: "feature" },
    ],
  },
]

// Sortable Item Component
function SortableItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getTypeColor = (type: Item["type"]) => {
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
function SortableContainer({ container }: { container: Container }) {
  return (
    <Card className="w-full rounded-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{container.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {container.items.length}
            </Badge>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <SortableContext items={container.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[100px] space-y-0">
            {container.items.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
            {container.items.length === 0 && (
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

export default function ProductBacklogSection({projectId}: Props) {
  const [containers, setContainers] = useState<Container[]>(initialContainers)
  const [activeItem, setActiveItem] = useState<Item | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const findContainer = (id: string) => {
    for (const container of containers) {
      if (container.items.find((item) => item.id === id)) {
        return container.id
      }
    }
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeContainer = findContainer(active.id as string)

    if (activeContainer) {
      const container = containers.find((c) => c.id === activeContainer)
      const item = container?.items.find((item) => item.id === active.id)
      setActiveItem(item || null)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId) || overId

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    setContainers((containers) => {
      const activeContainerIndex = containers.findIndex((c) => c.id === activeContainer)
      const overContainerIndex = containers.findIndex((c) => c.id === overContainer)

      const activeItems = containers[activeContainerIndex].items
      const overItems = containers[overContainerIndex].items

      const activeItemIndex = activeItems.findIndex((item) => item.id === activeId)
      const activeItem = activeItems[activeItemIndex]

      const newContainers = [...containers]

      // Remove item from active container
      newContainers[activeContainerIndex] = {
        ...newContainers[activeContainerIndex],
        items: activeItems.filter((item) => item.id !== activeId),
      }

      // Add item to over container
      newContainers[overContainerIndex] = {
        ...newContainers[overContainerIndex],
        items: [...overItems, activeItem],
      }

      return newContainers
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveItem(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId) || overId

    if (!activeContainer || !overContainer) {
      setActiveItem(null)
      return
    }

    if (activeContainer === overContainer) {
      setContainers((containers) => {
        const containerIndex = containers.findIndex((c) => c.id === activeContainer)
        const items = containers[containerIndex].items

        const activeIndex = items.findIndex((item) => item.id === activeId)
        const overIndex = items.findIndex((item) => item.id === overId)

        const newContainers = [...containers]
        newContainers[containerIndex] = {
          ...newContainers[containerIndex],
          items: arrayMove(items, activeIndex, overIndex),
        }

        return newContainers
      })
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
          <SortableContainer key={container.id} container={container} />
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
                    className={`text-xs ${activeItem.type === "task"
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
