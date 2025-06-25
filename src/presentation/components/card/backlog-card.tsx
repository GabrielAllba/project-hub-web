import { STATUS_PROGRESS_MAP } from "@/constants/constants"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { type Sprint } from "@/domain/entities/sprint"
import { type User } from "@/domain/entities/user"
import { useBacklog } from "@/shared/contexts/backlog-context"
import { useGetProjectMembers } from "@/shared/hooks/use-get-project-members"
import { useGetSprintById } from "@/shared/hooks/use-get-sprint-by-id"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { AlertTriangle, Circle, Minus } from "lucide-react"
import type React from "react"
import { forwardRef, useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface BacklogCardProps {
    task: ProductBacklog
    projectId: string
    isDragging?: boolean
    style?: React.CSSProperties
}

const PRIORITY_CONFIG = {
    HIGH: {
        color: "bg-red-100 text-red-700",
        icon: AlertTriangle,
        label: "High",
    },
    MEDIUM: {
        color: "bg-yellow-100 text-yellow-700",
        icon: Circle,
        label: "Medium",
    },
    LOW: {
        color: "bg-green-100 text-green-700",
        icon: Minus,
        label: "Low",
    },
}

export const BacklogCard = forwardRef<HTMLDivElement, BacklogCardProps>(
    ({ task, projectId, isDragging = false, style, ...props }, ref) => {
        const priority = PRIORITY_CONFIG[task.priority]
        const statusInfo = STATUS_PROGRESS_MAP[task.status]
        const [sprint, setSprint] = useState<Sprint>()
        const [assignee, setAssignee] = useState<User | null>(null)

        const {
            handleSetClickedBacklog
        } = useBacklog()

        const { triggerGetSprintById } = useGetSprintById(task.sprintId!)
        const { triggerGetProjectMembers } = useGetProjectMembers(projectId)

        useEffect(() => {
            if (task.sprintId) {
                triggerGetSprintById(task.sprintId).then((res) => {
                    if (res.status === "success") {
                        setSprint(res.data)
                    }
                })
            }
        }, [task.sprintId])

        useEffect(() => {
            const fetchAssignee = async () => {
                if (!task.assigneeId) return
                const roles = ["PRODUCT_OWNER", "SCRUM_MASTER", "DEVELOPER"] as const
                const results = await Promise.all(
                    roles.map((role) => triggerGetProjectMembers(role))
                )
                const all = results.flatMap((r) => r?.data || [])
                const found = all.find((user) => user.id === task.assigneeId)
                if (found) {
                    setAssignee({
                        ...found,
                        isEmailVerified: false,
                        isUserFirstTime: false,
                    })
                }
            }
            fetchAssignee()
        }, [task.assigneeId])

        return (
            <Card
                ref={ref}
                style={style}
                className={cn(
                    "rounded border bg-white transition-all duration-200 ease-in-out",
                    "hover:bg-gray-50 hover:border-gray-300 hover:cursor-pointer",
                    isDragging && "opacity-50 rotate-2 scale-105"
                )}
                {...props}
                onClick={() => {
                    handleSetClickedBacklog(task.id)
                }}
            >
                <CardContent className="p-4 space-y-3">
                    {/* Top Labels */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-2">
                            <Badge className={cn("text-xs px-2", priority.color)}>
                                {priority.label}
                            </Badge>
                            <Badge className="text-xs px-2 text-indigo-700 bg-indigo-100">
                                Back-End
                            </Badge>
                        </div>
                        {sprint && (
                            <span className="text-xs text-gray-400 font-medium">
                                {sprint.name}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                            {task.title}
                        </h4>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Circle
                                className={cn("w-3 h-3", {
                                    "text-gray-400": task.status === "TODO",
                                    "text-purple-500 animate-pulse": task.status === "INPROGRESS",
                                    "text-green-600": task.status === "DONE",
                                })}
                            />
                            {statusInfo.label}
                        </div>
                        <span className="text-xs text-gray-500">{statusInfo.percent}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full transition-all duration-300", {
                                "bg-gray-400": task.status === "TODO",
                                "bg-purple-500": task.status === "INPROGRESS",
                                "bg-green-600": task.status === "DONE",
                            })}
                            style={{ width: `${statusInfo.percent}%` }}
                        />
                    </div>

                    {/* Footer: assignee avatar with tooltip */}
                    <div className="flex justify-end items-center mt-2">
                        {assignee && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Avatar className="cursor-pointer h-6 w-6 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        <AvatarFallback
                                            className={cn("text-sm font-semibold text-white bg-gradient-to-br", getGradientForUser(assignee.username.charAt(0).toUpperCase()))}
                                        >
                                            {getUserInitials(assignee.username.charAt(0).toUpperCase())}
                                        </AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{assignee.username || assignee.email}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }
)

BacklogCard.displayName = "BacklogCard"
