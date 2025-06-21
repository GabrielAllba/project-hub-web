
interface EmptyStateProps {
  message?: string
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-6 text-muted-foreground">

      <p className="text-sm">{message}</p>
    </div>
  )
}
