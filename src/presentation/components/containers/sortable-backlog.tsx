"use client"

import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BacklogItem } from "../items/backlog-item"

interface SortableBacklogProps {
    backlog: ProductBacklog
}

export function SortableBacklog(props: SortableBacklogProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props.backlog.id,
        data: {
            backlog: props.backlog
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <BacklogItem
                backlog={props.backlog}
            />
        </div>
    )
}