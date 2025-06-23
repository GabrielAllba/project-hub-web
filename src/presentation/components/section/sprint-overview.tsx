"use client"

import { useGetSprintOverview } from "@/shared/hooks/use-get-sprint-overview"
import { getSprintStatusColor, getSprintStatusLabel } from "@/shared/utils/sprint-utils"
import { Target } from "lucide-react"
import { useEffect } from "react"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"

interface SprintOverviewProps {
    sprintId: string
}

export const SprintOverview = ({ sprintId }: SprintOverviewProps) => {
    const {
        triggerGetSprintOverview,
        triggerGetSprintOverviewResponse: overview,
        triggerGetSprintOverviewLoading,
        triggerGetSprintOverviewError,
    } = useGetSprintOverview(sprintId)

    useEffect(() => {
        triggerGetSprintOverview(sprintId)
    }, [sprintId])

    if (triggerGetSprintOverviewLoading) {
        return (
            <Card className="rounded-sm">
                <CardHeader>
                    <CardTitle>Loading Sprint Overview...</CardTitle>
                </CardHeader>
            </Card>
        )
    }

    if (triggerGetSprintOverviewError || !overview) {
        return (
            <Card className="rounded-sm">
                <CardHeader>
                    <CardTitle>Error loading sprint overview</CardTitle>
                    <CardDescription>Please try again later.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

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
                            {overview.data.startDate && new Date(overview.data.startDate).toDateString() + " - "}
                            {overview.data.endDate && new Date(overview.data.endDate).toDateString()}
                        </CardDescription>
                    </div>
                    <Badge
                        variant="outline"
                        className={`${getSprintStatusColor(overview.data.status)} rounded-sm`}
                    >
                        {getSprintStatusLabel(overview.data.status)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {overview.data.sprintGoal && (
                    <div>
                        <h4 className="font-medium mb-2">Sprint Goal</h4>
                        <p className="text-muted-foreground">{overview.data.sprintGoal}</p>
                    </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{overview.data.totalTasks}</div>
                        <div className="text-sm text-muted-foreground">Total Tasks</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{overview.data.completedTasks}</div>
                        <div className="text-sm text-muted-foreground">Tasks Done</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{overview.data.totalPoints}</div>
                        <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{overview.data.completedPoints}</div>
                        <div className="text-sm text-muted-foreground">Points Done</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
