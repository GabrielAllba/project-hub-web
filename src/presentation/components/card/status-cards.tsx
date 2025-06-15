import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface StatusCardsProps {
    unassigned: number
    inProgress: number
    completed: number
}

export function StatusCards({ unassigned, inProgress, completed }: StatusCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <CardTitle className="text-lg font-medium">To do</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{unassigned}</span>
                        <span className="ml-2 text-muted-foreground">Tasks</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <CardTitle className="text-lg font-medium">In Progress</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{inProgress}</span>
                        <span className="ml-2 text-muted-foreground">Tasks in progress</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <CardTitle className="text-lg font-medium">Completed</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{completed}</span>
                        <span className="ml-2 text-muted-foreground">Tasks completed</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
