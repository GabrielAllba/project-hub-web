// @/components/BacklogItem.tsx
"use client"

import {
    PRODUCT_BACKLOG_PRIORITY_OPTIONS,
    PRODUCT_BACKLOG_STATUS_OPTIONS,
    type ProjectRole
} from "@/constants/constants"
import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { User } from "@/domain/entities/user"
import { useBacklog } from "@/shared/contexts/backlog-context"
import { useSprint } from "@/shared/contexts/sprint-context"; // Import useSprint
import { useGetProjectMembers } from "@/shared/hooks/use-get-project-members"
import {
    getPriorityColor,
    getPriorityLabel,
    getStatusColor,
    getStatusLabel
} from "@/shared/utils/product-backlog-utils"
import {
    ChevronDown,
    Eye,
    GripVertical,
    Pencil,
    Trash2
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ProductGoalModal } from "../modal/product-goal-modal"
import { AssigneeSelector } from "../selector/assignee-selector"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface BacklogItemProps {
    backlog: ProductBacklog
}

export function BacklogItem({ backlog }: BacklogItemProps) {
    const navigate = useNavigate()
    const {
        editBacklogPoint,
        editBacklogTitle,
        editBacklogPriority,
        editBacklogStatus,
        editBacklogGoal,
        assignBacklogUser,
        deleteUnassignedBacklog,
    } = useBacklog()

    const {
        deleteSprintBacklogItem,
        editBacklogPoint: editSprintBacklogPoint,
        editBacklogTitle: editSprintBacklogTitle,
        editBacklogPriority: editSprintBacklogPriority,
        editBacklogStatus: editSprintBacklogStatus,
        editBacklogGoal: editSprintBacklogGoal,
        assignBacklogUser: assignSprintBacklogUser,
    } = useSprint()

    const [assignee, setAssignee] = useState<User | null>(null)
    const [isEditingPoint, setIsEditingPoint] = useState(false)
    const [pointValue, setPointValue] = useState(backlog.point ?? 0)
    const [isHoveringTitle, setIsHoveringTitle] = useState(false)
    const [editingTitleBacklog, setEditingTitleBacklog] = useState<ProductBacklog>()
    const [titleValue, setTitleValue] = useState(backlog.title)
    const [isHoveringItem, setIsHoveringItem] = useState(false)

    const { triggerGetProjectMembers } = useGetProjectMembers(backlog.projectId)
    const [members, setMembers] = useState<User[]>([])

    useEffect(() => {
        const fetch = async () => {
            const roles: ProjectRole[] = ["PRODUCT_OWNER", "SCRUM_MASTER", "DEVELOPER"]
            const results = await Promise.all(
                roles.map(role => triggerGetProjectMembers(role))
            )
            const all = results.flatMap(r => r?.data || [])
            const unique: ProjectUserResponseDTO[] = Array.from(new Map(all.map(m => [m.id, m])).values())
            const uniqueUsers: User[] = unique.map((dto) => ({
                ...dto,
                isEmailVerified: false,
                isUserFirstTime: false
            }))
            setMembers(uniqueUsers)
        }
        fetch()
    }, [backlog.projectId]) // Added triggerGetProjectMembers to dependency array

    useEffect(() => {
        if (backlog.assigneeId) {
            const found = members.find((m) => m.id === backlog.assigneeId)
            if (found) setAssignee(found)
        } else {
            setAssignee(null) // Clear assignee if backlog.assigneeId is null/undefined
        }
    }, [backlog.assigneeId, members])

    const handlePointSubmit = async () => {
        if (backlog.sprintId) {
            await editSprintBacklogPoint(backlog.sprintId, backlog.id, pointValue)
            setIsEditingPoint(false)
            toast.success("Backlog point updated successfully!")
        } else {
            await editBacklogPoint(backlog.id, pointValue)
            setIsEditingPoint(false)
            toast.success("Backlog point updated successfully!")
        }
    }

    const handleDeleteBacklog = async () => {
        if (backlog.sprintId) {
            await deleteSprintBacklogItem(backlog.sprintId, backlog.id)
            toast.success("Backlog removed from sprint successfully!")
        } else {
            await deleteUnassignedBacklog(backlog.id)
            toast.success("Backlog deleted successfully!")
        }
    }

    const handleTitleSubmit = async () => {
        if (backlog.sprintId) {
            await editSprintBacklogTitle(backlog.sprintId, backlog.id, titleValue)
            setEditingTitleBacklog(undefined)
            toast.success("Backlog title updated successfully!")
        } else {
            await editBacklogTitle(backlog.id, titleValue)
            setEditingTitleBacklog(undefined)
            toast.success("Backlog title updated successfully!")
        }
    }

    const handleProductGoalChange = async (goalId: string | null) => {
        if (backlog.sprintId) {
            await editSprintBacklogGoal(backlog.sprintId, backlog.id, goalId)
            toast.success("Product goal updated successfully!")
        } else {
            await editBacklogGoal(backlog.id, goalId)
            toast.success("Product goal updated successfully!")
        }
    }

    return (
        <Card
            className="py-0 hover:shadow-md transition-shadow rounded-none"
            onMouseEnter={() => setIsHoveringItem(true)}
            onMouseLeave={() => setIsHoveringItem(false)}
        >
            <CardContent className="p-2">
                <div className="grid grid-cols-[24px_1fr_144px_32px_48px_112px_112px_64px] items-center gap-2 w-full">
                    <div className="flex justify-center cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex items-center gap-1"
                        onMouseEnter={() => setIsHoveringTitle(true)}
                        onMouseLeave={() => setIsHoveringTitle(false)}>
                        {!editingTitleBacklog || editingTitleBacklog.id !== backlog.id ? (
                            <div className="flex items-center gap-1 truncate">
                                <p className="text-sm truncate">{backlog.title}</p>
                                {isHoveringTitle && (
                                    <Pencil
                                        className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary"
                                        onClick={() => {
                                            setTitleValue(backlog.title)
                                            setEditingTitleBacklog(backlog)
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <Input
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleTitleSubmit()
                                    if (e.key === "Escape") setEditingTitleBacklog(undefined)
                                }}
                                autoFocus
                                className="text-sm h-7 pr-16 rounded-sm"
                            />
                        )}
                    </div>

                    <div className="flex justify-center items-center">
                        <ProductGoalModal
                            isHoveringItem={isHoveringItem}
                            projectId={backlog.projectId}
                            onSelectGoal={handleProductGoalChange}
                            selectedGoalId={backlog.productGoalId}
                            title="Select product goal"
                        />
                    </div>

                    <div className="flex justify-center">
                        <AssigneeSelector
                            projectId={backlog.projectId}
                            selectedAssignee={assignee}
                            onSelectAssignee={async (user) => {
                                if (backlog.sprintId) {
                                    await assignSprintBacklogUser(backlog.sprintId, backlog.id, user.id)
                                    setAssignee(user)
                                    toast.success("Assignee updated")
                                } else {
                                    await assignBacklogUser(backlog.id, user.id)
                                    setAssignee(user)
                                    toast.success("Assignee updated")
                                }
                            }}
                        />
                    </div>

                    <div className="flex justify-center items-center ">
                        {!isEditingPoint ? (
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs cursor-pointer h-full rounded-sm flex items-center"
                                        onClick={() => setIsEditingPoint(true)}
                                    >
                                        {backlog.point}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Points</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Input
                                type="number"
                                value={pointValue}
                                onChange={(e) => setPointValue(Number(e.target.value))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handlePointSubmit()
                                    if (e.key === "Escape") setIsEditingPoint(false)
                                }}
                                className="h-6 w-14 rounded-sm text-xs"
                                autoFocus
                            />
                        )}
                    </div>

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className={`w-full cursor-pointer flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(backlog.priority)}`}>
                                <span>{getPriorityLabel(backlog.priority)}</span>
                                <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 mt-1 rounded-sm p-0">
                                {PRODUCT_BACKLOG_PRIORITY_OPTIONS.map(priority => (
                                    <DropdownMenuItem
                                        key={priority}
                                        onClick={async () => {
                                            if (priority !== backlog.priority) {
                                                if (backlog.sprintId) {
                                                    await editSprintBacklogPriority(backlog.sprintId, backlog.id, priority)
                                                    toast.success("Priority updated successfully!")
                                                } else {
                                                    await editBacklogPriority(backlog.id, priority)
                                                    toast.success("Priority updated successfully!")
                                                }
                                            }
                                        }}
                                    >
                                        <span className={`px-2 text-xs font-medium rounded-sm ${getPriorityColor(priority)}`}>
                                            {getPriorityLabel(priority)}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className={`w-full cursor-pointer flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(backlog.status)}`}>
                                <span>{getStatusLabel(backlog.status)}</span>
                                <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 mt-1 rounded-sm p-0">
                                {PRODUCT_BACKLOG_STATUS_OPTIONS.map(status => (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={async () => {
                                            if (status !== backlog.status) {
                                                if (backlog.sprintId) {
                                                    await editSprintBacklogStatus(backlog.sprintId, backlog.id, status)
                                                    toast.success("Status updated successfully!")
                                                } else {
                                                    await editBacklogStatus(backlog.id, status)
                                                    toast.success("Status updated successfully!")
                                                }
                                            }
                                        }}
                                    >
                                        <span className={`px-2 text-xs font-medium rounded-sm ${getStatusColor(status)}`}>
                                            {getStatusLabel(status)}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex justify-end gap-1">
                        <Eye
                            className="w-4 h-4 text-muted-foreground hover:text-blue-500 cursor-pointer"
                            onClick={() => {
                                const search = new URLSearchParams(window.location.search)
                                search.set("backlogId", backlog.id)
                                navigate({ search: search.toString() }, { replace: true })
                            }}
                        />
                        <Trash2
                            className="w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer"
                            onClick={handleDeleteBacklog} // Call the unified handler
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}