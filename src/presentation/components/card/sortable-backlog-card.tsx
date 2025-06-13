import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BacklogCard } from "./backlog-card"



interface SortableBacklogCardProps {
  task: ProductBacklog
}

export function SortableBacklogCard({ task }: SortableBacklogCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return <BacklogCard ref={setNodeRef} task={task} isDragging={isDragging} style={style} {...attributes} {...listeners} />
}
