import { STATUS_PROGRESS_MAP } from "@/constants/constants";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { type Sprint } from "@/domain/entities/sprint";
import { useGetSprintById } from "@/shared/hooks/use-get-sprint-by-id";
import { cn } from "@/shared/utils/merge-class";
import {
    AlertTriangle, Circle,
    Link as LinkIcon,
    MessageSquare,
    Minus
} from "lucide-react";
import type React from "react";
import { forwardRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface BacklogCardProps {
    task: ProductBacklog
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
    ({ task, isDragging = false, style, ...props }, ref) => {
        const priority = PRIORITY_CONFIG[task.priority]
        const [sprint, setSprint] = useState<Sprint>()

        const getInitials = (id: string | null) => {
            if (!id) return "?"
            return id.slice(-2).toUpperCase()
        }

        const statusInfo = STATUS_PROGRESS_MAP[task.status]

        const { triggerGetSprintById } = useGetSprintById(task.sprintId!)

        useEffect(() => {
            if (task.sprintId) {
                triggerGetSprintById(task.sprintId).then((res) => {
                    setSprint(res.data)
                })
            }
        }, [task])


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
            >

                <CardContent className="p-4 space-y-3">
                    {/* Top Labels */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-2">
                            <Badge className={cn("text-xs px-2", priority.color)}>{priority.label}</Badge>
                            <Badge className="text-xs px-2 text-indigo-700 bg-indigo-100">Back-End</Badge>
                        </div>
                        {sprint && <span className="text-xs text-gray-400 font-medium">{sprint.name}</span>}
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{task.title}</h4>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Circle className={cn("w-3 h-3", {
                                "text-gray-400": task.status === "TODO",
                                "text-purple-500 animate-pulse": task.status === "INPROGRESS",
                                "text-green-600": task.status === "DONE",
                            })} />
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


                    {/* Footer: avatars + icons */}
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex -space-x-2">
                            {[task.assigneeId].filter(Boolean).map((id) => (
                                <Avatar key={id} className="w-6 h-6 border-2 border-white">
                                    <AvatarFallback className="bg-gray-400 text-white text-xs">
                                        {getInitials(id)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>2</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <LinkIcon className="w-4 h-4" />
                                <span>1</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }
)

BacklogCard.displayName = "BacklogCard"
