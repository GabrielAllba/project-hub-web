"use client"

import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Backlog } from "./backlog"

interface SortableBacklogProps {
    id: string
    backlog: ProductBacklog
    onDeleteBacklog: (backlog: ProductBacklog) => void
}

export function SortableBacklog({ id, backlog, onDeleteBacklog }: SortableBacklogProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: {
            backlog: backlog
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Backlog
                id={id}
                backlog={backlog} 
                onDeleteBacklog={(backlog: ProductBacklog) => {
                    onDeleteBacklog(backlog)
                }}/>
        </div>
    )
}
