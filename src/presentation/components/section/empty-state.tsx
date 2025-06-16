interface EmptyStateProps {
  icon?: React.ReactNode
  message?: string
}

export const EmptyState = ({ icon = "👥", message }: EmptyStateProps) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-6 text-muted-foreground">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  )
}
