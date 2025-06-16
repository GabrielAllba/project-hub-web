import type { SprintReport } from "@/domain/entities/sprint-report"
import { getSprintStatusColor, getSprintStatusLabel } from "@/shared/utils/sprint-utils"
import { Target } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"


interface SprintOverviewProps {
    sprintReport: SprintReport
    completionPercentage: number
}

export const SprintOverview = ({ sprintReport }: SprintOverviewProps) => {
    return (
        <Card className="rounded-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Sprint Overview
                        </CardTitle>
                        <CardDescription>
                            {new Date(sprintReport.sprint.startDate).toLocaleDateString()} -{" "}
                            {new Date(sprintReport.sprint.endDate).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${getSprintStatusColor(sprintReport.sprint.status)} rounded-sm`}>
                        {getSprintStatusLabel(sprintReport.sprint.status)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {sprintReport.sprint.sprintGoal && (
                    <div>
                        <h4 className="font-medium mb-2">Sprint Goal</h4>
                        <p className="text-muted-foreground">{sprintReport.sprint.sprintGoal}</p>
                    </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{sprintReport.totalTask}</div>
                        <div className="text-sm text-muted-foreground">Total Tasks</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{sprintReport.doneTask}</div>
                        <div className="text-sm text-muted-foreground">Tasks Done</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{sprintReport.totalTaskPoints}</div>
                        <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{sprintReport.doneTaskPoints}</div>
                        <div className="text-sm text-muted-foreground">Points Done</div>
                    </div>

                </div>

            </CardContent>
        </Card>
    )
}
