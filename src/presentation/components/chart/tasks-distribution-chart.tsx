"use client"

import { useGetSprintTaskDistribution } from "@/shared/hooks/use-get-sprint-task-distribution"
import { BarChart3 } from "lucide-react"
import { useEffect } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card"

interface TasksDistributionChartProps {
    sprintId: string
}

export const TasksDistributionChart = ({ sprintId }: TasksDistributionChartProps) => {
    const {
        triggerGetSprintTaskDistribution,
        triggerGetSprintTaskDistributionError,
        triggerGetSprintTaskDistributionLoading,
        triggerGetSprintTaskDistributionResponse
    } = useGetSprintTaskDistribution(sprintId)

    useEffect(() => {
        if (sprintId) {
            triggerGetSprintTaskDistribution(sprintId)
        }
    }, [sprintId])


    if (triggerGetSprintTaskDistributionResponse?.status == "success") {


        return (
            <Card className="rounded-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Task Distribution by Team Member
                    </CardTitle>
                    <CardDescription>
                        Task points assigned to each team member in this sprint
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {triggerGetSprintTaskDistributionLoading ? (
                        <p className="text-sm text-muted-foreground">Loading chart...</p>
                    ) : triggerGetSprintTaskDistributionError ? (
                        <p className="text-sm text-red-500">Failed to load chart data</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={triggerGetSprintTaskDistributionResponse?.data}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number, name: string) => {
                                            const labels: { [key: string]: string } = {
                                                doneTasks: "Completed Tasks",
                                                inProgressTasks: "In Progress Tasks",
                                                todoTasks: "Todo Tasks",
                                                totalTasks: "Total Tasks",
                                            }
                                            return [value, labels[name] || name]
                                        }}
                                    />
                                    <Bar
                                        dataKey="doneTasks"
                                        stackId="a"
                                        fill="#22c55e"
                                        name="doneTasks"
                                    />
                                    <Bar
                                        dataKey="inProgressTasks"
                                        stackId="a"
                                        fill="#3b82f6"
                                        name="inProgressTasks"
                                    />
                                    <Bar
                                        dataKey="todoTasks"
                                        stackId="a"
                                        fill="#6b7280"
                                        name="todoTasks"
                                    />
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Legend */}
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                                    <span className="text-sm">Completed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                    <span className="text-sm">In Progress</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
                                    <span className="text-sm">Todo</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        )
    }
}
