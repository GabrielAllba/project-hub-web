import type { ProductBacklogWithContainer } from "@/domain/entities/product-backlog"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ProductBacklogItem } from "./product-backlog-item"


interface SortableProductBacklogItemProps {
    productBacklog: ProductBacklogWithContainer
}

export const SortableProductBacklogItem = ({ productBacklog }: SortableProductBacklogItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: productBacklog.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <ProductBacklogItem productBacklog={productBacklog} dragHandleProps={{ ...attributes, ...listeners }} />
        </div>
    )
}
