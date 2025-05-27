"use client"

import type React from "react"

import type { ProductBacklogWithContainer } from "@/domain/entities/product-backlog"
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useState } from "react"

export const useDragAndDropProductBacklog = (
  productBacklogs: ProductBacklogWithContainer[],
  setProductBacklogs: React.Dispatch<React.SetStateAction<ProductBacklogWithContainer[]>>,
) => {

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeProductBacklog = productBacklogs.find((productBacklog) => productBacklog.id === activeId)
    if (!activeProductBacklog) return

    const activeContainer = activeProductBacklog.containerId

    let overContainer: string | undefined

    if (overId === "backlog" || overId.startsWith("sprint-")) {
      overContainer = overId
    } else {
      const overProductBacklog = productBacklogs.find((productBacklog) => productBacklog.id === overId)
      if (overProductBacklog) {
        overContainer = overProductBacklog.containerId
      }
    }

    if (!overContainer || activeContainer === overContainer) return

    setProductBacklogs((prevProductBacklog) => {
      const activeIndex = prevProductBacklog.findIndex((t) => t.id === activeId)
      if (activeIndex === -1) return prevProductBacklog

      const newProductBacklog = [...prevProductBacklog]
      newProductBacklog[activeIndex] = { ...newProductBacklog[activeIndex], containerId: overContainer }

      return newProductBacklog
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeProductBacklog = productBacklogs.find((productBacklog) => productBacklog.id === activeId)
    if (!activeProductBacklog) return

    if (overId === "backlog" || overId.startsWith("sprint-")) {
      if (activeProductBacklog.containerId !== overId) {
        setProductBacklogs((prevProductBacklog) => {
          const newProductBacklog = [...prevProductBacklog]
          const productBacklogIndex = newProductBacklog.findIndex((t) => t.id === activeId)
          if (productBacklogIndex !== -1) {
            newProductBacklog[productBacklogIndex] = { ...newProductBacklog[productBacklogIndex], containerId: overId }
          }
          return newProductBacklog
        })
      }
      return
    }

    const overProductBacklog = productBacklogs.find((productBacklog) => productBacklog.id === overId)
    if (overProductBacklog && activeProductBacklog.containerId === overProductBacklog.containerId) {
      const containerProductBacklogs = productBacklogs.filter((productBacklog) => productBacklog.containerId === activeProductBacklog.containerId)
      const activeIndex = containerProductBacklogs.findIndex((t) => t.id === activeId)
      const overIndex = containerProductBacklogs.findIndex((t) => t.id === overId)

      if (activeIndex !== overIndex) {
        const reorderedProductBacklog = arrayMove(containerProductBacklogs, activeIndex, overIndex)

        setProductBacklogs((prevProductBacklog) => {
          const otherProductBacklog = prevProductBacklog.filter((productBacklog) => productBacklog.containerId !== activeProductBacklog.containerId)
          return [...otherProductBacklog, ...reorderedProductBacklog]
        })
      }
    }
  }

  const activeProductBacklog = activeId ? productBacklogs.find((productBacklog) => productBacklog.id === activeId) : null

  return {
    sensors,
    activeId,
    activeProductBacklog,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}
