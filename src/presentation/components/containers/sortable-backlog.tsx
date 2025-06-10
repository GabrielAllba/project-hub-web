"use client"

import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BacklogItem } from "../items/backlog-item"

interface SortableBacklogProps {
    id: string
    backlog: ProductBacklog
    onDeleteBacklog: (backlog: ProductBacklog) => void
    onEditBacklog: (backlogId: string) => void
}

export function SortableBacklog(props: SortableBacklogProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props.id,
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
                id={props.id}
                backlog={props.backlog}
                onDeleteBacklog={(backlog: ProductBacklog) => {
                    props.onDeleteBacklog(backlog)
                }}
                onEditBacklog={props.onEditBacklog}
            />
        </div>
    )
}