import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

interface StatusCardsProps {
    todo: number
    inProgress: number
    completed: number
    isLoading?: boolean
    isError?: boolean
}

export function StatusCards({
    todo,
    inProgress,
    completed,
    isLoading,
    isError
}: StatusCardsProps) {
    const renderCard = (
        color: string,
        title: string,
        value: number,
        subtitle: string
    ) => (
        <Card className="rounded-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${color} mr-2`} />
                    <CardTitle className="text-lg font-medium">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="w-24 h-10" />
                ) : isError ? (
                    <span className="text-red-500">Failed to load</span>
                ) : (
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{value}</span>
                        <span className="ml-2 text-muted-foreground">{subtitle}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderCard("bg-orange-500", "To Do", todo, "Tasks")}
                {renderCard("bg-blue-500", "In Progress", inProgress, "Tasks in progress")}
                {renderCard("bg-green-500", "Done", completed, "Tasks completed")}
            </div>
        </div>
    )
}
