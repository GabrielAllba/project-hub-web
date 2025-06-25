import { CheckCircle, Clock, ListChecks, Loader2 } from "lucide-react"
import type { JSX } from "react"
import { Card } from "../ui/card"
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
    isError,
}: StatusCardsProps) {
    const renderMiniCard = (
        icon: JSX.Element,
        value: number,
        label: string,
        bgColor: string
    ) => (
        <Card className="flex flex-wrap flex-row  px-2 py-2 items-center gap-4 border rounded-lg">
            <div
                className={`h-10 w-10 rounded-md flex items-center justify-center ${bgColor}`}
            >
                {icon}
            </div>
            <div>
                {isLoading ? (
                    <Skeleton className="w-20 h-6" />
                ) : isError ? (
                    <span className="text-red-500 text-sm">Failed to load</span>
                ) : (
                    <>
                        <p className="text-base font-semibold">
                            {value} {label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            in progress sprint
                        </p>
                    </>
                )}
            </div>
        </Card>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderMiniCard(
                <ListChecks size={20} className="text-slate-600" />,
                (todo + inProgress + completed),
                "total tasks",
                "bg-slate-100"
            )}
            {renderMiniCard(
                <Clock size={20} className="text-orange-600" />,
                todo,
                "todo",
                "bg-orange-100"
            )}
            {renderMiniCard(
                <Loader2 size={20} className="text-blue-600" />,
                inProgress,
                "in progress",
                "bg-blue-100"
            )}
            {renderMiniCard(
                <CheckCircle size={20} className="text-green-600" />,
                completed,
                "completed",
                "bg-green-100"
            )}
        </div>
    )
}
