"use client"

import * as React from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    XAxis,
    YAxis
} from "recharts"

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
    date: string
}

const rawData: ChartEntry[] = [
    { name: "Alice", todo: 2, inProgress: 3, done: 4, date: "2024-06-01" },
    { name: "Bob", todo: 1, inProgress: 4, done: 2, date: "2024-06-05" },
    { name: "Charlie", todo: 0, inProgress: 2, done: 6, date: "2024-06-07" },
    { name: "Alice", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "Bob", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "Charlie", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "A", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "B", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "C", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "D", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "E", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "F", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "G", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "H", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "I", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "J", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "K", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "L", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "M", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "N", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "O", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "P", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "Q", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "R", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "S", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "T", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "U", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "V", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "W", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "X", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "Y", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
    { name: "Z", todo: 1, inProgress: 1, done: 3, date: "2024-06-10" },
    { name: "AA", todo: 3, inProgress: 0, done: 1, date: "2024-06-11" },
    { name: "AB", todo: 2, inProgress: 1, done: 5, date: "2024-06-12" },
]

const chartConfig = {
    todo: {
        label: "To Do",
        color: "#C084FC", // ungu pastel yang lebih kuat
    },
    inProgress: {
        label: "In Progress",
        color: "#60A5FA", // biru lembut tapi jelas
    },
    done: {
        label: "Done",
        color: "#4ADE80", // hijau pastel tapi tegas
    },
}


export function ChartAreaInteractive() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")

    React.useEffect(() => {
        if (isMobile) setTimeRange("7d")
    }, [isMobile])

    const filteredData = React.useMemo(() => {
        const today = new Date("2024-06-13")
        const range = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
        const start = new Date(today)
        start.setDate(today.getDate() - range)

        return rawData.filter((d) => new Date(d.date) >= start)
    }, [timeRange])

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
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
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
                            <SelectItem value="90d">Last 3 months</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="overflow-x-auto">
                    <ChartContainer config={chartConfig} className="h-[300px] w-[1500px]">
                        <BarChart width={1500} height={300} data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Legend />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        labelFormatter={(val) => `Person: ${val}`}
                                    />
                                }
                            />
                            <Bar dataKey="todo" fill={chartConfig.todo.color} />
                            <Bar dataKey="inProgress" fill={chartConfig.inProgress.color} />
                            <Bar dataKey="done" fill={chartConfig.done.color} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>


        </Card>
    )
}
