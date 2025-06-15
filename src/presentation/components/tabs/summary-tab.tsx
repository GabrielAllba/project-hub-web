"use client"

import { useEffect, useState } from "react"
import { StatusCards } from "../card/status-cards"
import { ChartAreaInteractive } from "../chart/chart-area-interactive"

// Mock data - replace with actual data fetching
const mockTaskData = {
    unassigned: 14,
    inProgress: 21,
    completed: 3,
    assignees: [
        { name: "Unassigned", count: 17, percentage: 52, color: "#9333ea" },
        { name: "Alexsmith", count: 8, percentage: 24, color: "#c084fc" },
        { name: "Sam Lee", count: 4, percentage: 12, color: "#e9d5ff" },
    ],
    weeklyTasks: [
        { day: "M", unassigned: 1, alexsmith: 2, samLee: 3 },
        { day: "T", unassigned: 2, alexsmith: 3, samLee: 3 },
        { day: "W", unassigned: 3, alexsmith: 2, samLee: 3 },
        { day: "T", unassigned: 2, alexsmith: 2, samLee: 2 },
        { day: "F", unassigned: 3, alexsmith: 2, samLee: 3 },
        { day: "S", unassigned: 2, alexsmith: 2, samLee: 2 },
    ],
    workloadByStatus: [
        {
            assignee: "Unassigned",
            todo: 5,
            inProgress: 6,
            review: 3,
            done: 3,
        },
        {
            assignee: "Alexsmith",
            todo: 2,
            inProgress: 3,
            review: 1,
            done: 2,
        },
        {
            assignee: "Sam Lee",
            todo: 1,
            inProgress: 2,
            review: 0,
            done: 1,
        },
    ],
}

export type TaskData = typeof mockTaskData

interface SummaryTabProps {
    projectId: string
}

export const SummaryTab = ({ projectId }: SummaryTabProps) => {
    const [taskData, setTaskData] = useState<TaskData>(mockTaskData)



    useEffect(() => {

    }, [projectId])


    return (
        <div className="space-y-6">
            <StatusCards
                unassigned={taskData.unassigned}
                inProgress={taskData.inProgress}
                completed={taskData.completed} />

            <div className="grid grid-cols-1 gap-6">
                <ChartAreaInteractive></ChartAreaInteractive>
            </div>
        </div>
    )
}
