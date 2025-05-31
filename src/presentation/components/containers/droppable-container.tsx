import { useDroppable } from "@dnd-kit/core";

export function DroppableContainer({
  id,
  children,
  className,
}: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? "bg-blue-50 border-blue-300" : ""} transition-colors`}>
      {children}
    </div>
  )
}