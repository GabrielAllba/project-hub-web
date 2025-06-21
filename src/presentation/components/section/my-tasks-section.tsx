"use client"

import {
    IconCheckbox,
    IconFolder,
    IconLoader2,
    IconRocket,
    IconSubtask,
    IconTarget
} from "@tabler/icons-react"
import { useState } from "react"

import { Button } from "../ui/button"
import { Separator } from "../ui/separator"

interface Task {
    id: string
    title: string
    projectName: string
    sprintName: string
    productGoalTitle?: string
    status: "TODO" | "IN_PROGRESS" | "DONE"
    point: number
}

const dummyTasks: Task[] = Array.from({ length: 20 }, (_, i) => ({
    id: `task-${i + 1}`,
    title: `Implement feature ${i + 1}`,
    projectName: `Project ${Math.floor(i / 5) + 1}`,
    sprintName: `Sprint ${Math.floor(i / 3) + 1}`,
    productGoalTitle: i % 3 === 0 ? `Goal ${Math.floor(i / 3) + 1}` : undefined,
    status: i % 3 === 0 ? "TODO" : i % 3 === 1 ? "IN_PROGRESS" : "DONE",
    point: (i % 5) + 1
}))

export const MyTasksSection = () => {
    const PAGE_SIZE = 6
    const [page, setPage] = useState(1)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const tasks = dummyTasks.slice(0, page * PAGE_SIZE)
    const hasMore = tasks.length < dummyTasks.length

    const handleLoadMore = () => {
        if (isLoadingMore || !hasMore) return
        setIsLoadingMore(true)
        setTimeout(() => {
            setPage((prev) => prev + 1)
            setIsLoadingMore(false)
        }, 600)
    }

    const getStatusBadge = (status: Task["status"]) => {
        switch (status) {
            case "TODO":
                return <span className="text-xs text-muted-foreground">To Do</span>
            case "IN_PROGRESS":
                return (
                    <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-sm">
                        In Progress
                    </span>
                )
            case "DONE":
                return (
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-sm">
                        Done
                    </span>
                )
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 pt-4">
                <IconSubtask className="text-blue-600" />
                <span className="text-base font-medium">My Active Tasks</span>
            </div>

            <div className="flex flex-col">
                {tasks.map((task, index) => (
                    <div key={task.id}>
                        <div className="flex justify-between items-start py-3 hover:bg-muted/50 transition px-1 rounded-sm">
                            {/* Left */}
                            <div className="flex gap-3 items-start">
                                <IconCheckbox className="text-muted-foreground mt-1 w-4 h-4" />

                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{task.title}</span>

                                    <div className="text-xs text-muted-foreground flex gap-4 flex-wrap mt-1">
                                        <span className="flex items-center gap-1">
                                            <IconFolder size={12} />
                                            {task.projectName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <IconRocket size={12} />
                                            {task.sprintName}
                                        </span>
                                        {task.productGoalTitle && (
                                            <span className="flex items-center gap-1">
                                                <IconTarget size={12} />
                                                {task.productGoalTitle}
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">
                                            {task.point} pts
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Status only */}
                            <div className="pt-1">{getStatusBadge(task.status)}</div>
                        </div>

                        {index < tasks.length - 1 && <Separator className="my-1" />}
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        variant="outline"
                        className="min-w-48"
                    >
                        {isLoadingMore ? (
                            <>
                                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading more...
                            </>
                        ) : (
                            <>Load more tasks</>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
