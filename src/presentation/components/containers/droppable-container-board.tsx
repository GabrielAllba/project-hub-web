import type { ProductBacklog, ProductBacklogStatus } from "@/domain/entities/product-backlog"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { SortableBacklogCard } from "../card/sortable-backlog-card"


interface DroppableContainerBoardProps {
  id: ProductBacklogStatus
  title: string
  tasks: ProductBacklog[]
}

export function DroppableContainerBoard({ id, title, tasks }: DroppableContainerBoardProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <Card className="w-80 flex-shrink-0 bg-muted/30 rounded">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center text-base">
          <span>{title}</span>
          <span className="bg-background text-muted-foreground px-2 py-1 rounded-full text-xs font-normal">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div ref={setNodeRef} className="min-h-[500px] space-y-2">
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center text-muted-foreground text-sm min-h-[200px] flex items-center justify-center">
                Drop tasks here
              </div>
            ) : (
              tasks.map((task) => <SortableBacklogCard key={task.id} task={task} />)
            )}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  )
}
