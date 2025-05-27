import { useDroppable } from "@dnd-kit/core"
import type React from "react"

interface DroppableContainerProps {
    containerId: string
    children: React.ReactNode
}

export const DroppableContainer = ({ containerId, children }: DroppableContainerProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: containerId,
    })

    return (
        <div
            ref={setNodeRef}
            data-container-id={containerId}
            className={`min-h-[120px] p-2 rounded-lg transition-all duration-200 ${isOver ? "bg-blue-50 border-2 border-blue-300 border-dashed" : "border-2 border-transparent"
                }`}
        >
            {children}
        </div>
    )
}
