"use client"

import * as React from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    XAxis,
    YAxis,
} from "recharts"

import { useGetProjectWorkSummary } from "@/shared/hooks/use-get-project-work-summary"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "../ui/toggle-group"

type ChartEntry = {
    name: string
    todo: number
    inProgress: number
    done: number
}

const chartConfig = {
    todo: {
        label: "To Do",
        color: "#C084FC", // purple
    },
    inProgress: {
        label: "In Progress",
        color: "#60A5FA", // blue
    },
    done: {
        label: "Done",
        color: "#4ADE80", // green
    },
}

export function ChartAreaInteractive({ projectId }: { projectId: string }) {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("3m")

    const {
        triggerGetProjectWorkSummary,
        triggerGetProjectWorkSummaryResponse,
        triggerGetProjectWorkSummaryLoading
    } = useGetProjectWorkSummary(projectId)

    React.useEffect(() => {
        if (isMobile) setTimeRange("7d")
    }, [isMobile])

    React.useEffect(() => {
        if (projectId && timeRange) {
            triggerGetProjectWorkSummary(timeRange)
        }
    }, [projectId, timeRange])

    const chartData: ChartEntry[] = React.useMemo(() => {
        if (!triggerGetProjectWorkSummaryResponse?.data) return []

        if (triggerGetProjectWorkSummaryResponse.data.length > 0) {

            return triggerGetProjectWorkSummaryResponse.data.map((entry) => ({
                name: entry.email ?? "Unassigned",
                todo: entry.todo ?? 0,
                inProgress: entry.inProgress ?? 0,
                done: entry.done ?? 0,
            }))
        }
        return []
    }, [triggerGetProjectWorkSummaryResponse?.data])

    return (
        <Card className="@container/card rounded-sm">
            <CardHeader>
                <CardTitle>Total Work Items</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">Filtered by selected range</span>
                    <span className="@[540px]/card:hidden">Filtered view</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={(val) => val && setTimeRange(val)}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="3m">Last 3 months</ToggleGroupItem>
                        <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                        <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="3m">Last 3 months</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {triggerGetProjectWorkSummaryLoading ? (
                    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        Loading chart data...
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        No data available for this range.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <ChartContainer config={chartConfig} className="h-[300px] min-w-[1500px]">
                            <BarChart width={1500} height={300} data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Legend />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            indicator="dot"
                                            labelFormatter={(val) => `User: ${val}`}
                                        />
                                    }
                                />
                                <Bar dataKey="todo" fill={chartConfig.todo.color} />
                                <Bar dataKey="inProgress" fill={chartConfig.inProgress.color} />
                                <Bar dataKey="done" fill={chartConfig.done.color} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
