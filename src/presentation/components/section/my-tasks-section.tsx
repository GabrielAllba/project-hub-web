"use client"

import {
    IconArrowIteration,
    IconCheckbox,
    IconFolder,
    IconLoader2,
    IconTargetArrow
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import type { GetMyActiveBacklogResponseDTO } from "@/domain/dto/res/get-my-active-backlog-res";
import { useGetMyActiveBacklogs } from "@/shared/hooks/use-get-my-active-backlogs";
import { getPriorityColor, getStatusColor } from "@/shared/utils/product-backlog-utils";
import { toast } from "sonner";
import { EmptyStateIllustration } from "../empty/empty-state";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";


export const MyTasksSection = () => {
    const { triggerGetMyActiveBacklogs } = useGetMyActiveBacklogs()
    const navigate = useNavigate()

    const [tasks, setTasks] = useState<GetMyActiveBacklogResponseDTO[]>([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const loadBacklogs = async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)

        try {
            const res = await triggerGetMyActiveBacklogs(page, DEFAULT_PAGE_SIZE)
            const content = res.data?.content ?? []

            setTasks((prev) => {
                const existingIds = new Set(prev.map((t) => t.id))
                const newTasks = content.filter((t) => !existingIds.has(t.id))
                return [...prev, ...newTasks]
            })

            setHasMore(content.length === DEFAULT_PAGE_SIZE)
        } catch (err) {
            toast.error("Failed to load tasks: " + err)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreBacklogs = useCallback(async () => {
        if (!hasMore || isLoading) return

        setIsLoading(true)
        try {
            const nextPage = page + 1
            const res = await triggerGetMyActiveBacklogs(nextPage, DEFAULT_PAGE_SIZE)

            if (res.status === "success") {
                const content = res.data?.content ?? []

                const newItems = content.filter(
                    (item) => !tasks.some((existing) => existing.id === item.id)
                )

                setTasks((prev) => [...prev, ...newItems])
                setPage(nextPage)
                setHasMore(!res.data?.last)
            }
        } catch (err) {
            toast.error("Failed to load more tasks: " + err)
        } finally {
            setIsLoading(false)
        }
    }, [hasMore, isLoading, page, tasks, triggerGetMyActiveBacklogs])



    useEffect(() => {
        loadBacklogs()
    }, [])

    const handleTaskClick = useCallback((task: GetMyActiveBacklogResponseDTO) => {
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('tab', 'list');
        newSearchParams.set('search', task.title);
        navigate(`/dashboard/project/${task.projectId}?${newSearchParams.toString()}`);
    }, [navigate]);

    if (!isLoading && tasks.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 pt-4">

                    <span className="text-base font-medium">My Active Tasks</span>
                </div>
                <div className="pt-6">
                    <EmptyStateIllustration type="no-task" />
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 pt-4">
                <span className="text-base font-medium">My Active Tasks</span>
            </div>

            <div className="flex flex-col">
                {tasks.map((task, index) => (
                    <div key={task.id}>
                        <div
                            className="flex justify-between items-start py-3 hover:bg-muted/50 transition px-1 rounded-sm cursor-pointer"
                            onClick={() => handleTaskClick(task)}
                        >
                            {/* Left */}
                            <div className="flex gap-3 items-start">
                                <IconCheckbox className="text-muted-foreground mt-1 w-4 h-4" />

                                <div className="flex flex-col ">
                                    <span className="text-sm font-medium">{task.title}</span>

                                    <div className="text-xs text-muted-foreground flex items-center gap-4 flex-wrap mt-1">
                                        <span className="flex items-center gap-1">
                                            <IconFolder size={12} className="text-yellow-500" />
                                            {task.projectName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <IconArrowIteration size={12} className="text-blue-500" />
                                            {task.sprintName}
                                        </span>
                                        {task.productGoalId && (
                                            <span className="flex items-center gap-1">
                                                <IconTargetArrow size={12} className="text-red-600" />
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
                            <div className="flex gap-2">
                                <div className={`p-1 px-2 rounded-md text-xs font-semibold ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </div>
                                <div className={`p-1 px-2 rounded-md text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </div>
                            </div>

                        </div>

                        {index < tasks.length - 1 && <Separator className="my-1" />}
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={loadMoreBacklogs}
                        disabled={isLoading}
                        variant="outline"
                        className="min-w-48"
                    >
                        {isLoading ? (
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