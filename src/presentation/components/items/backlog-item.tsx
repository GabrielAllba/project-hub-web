"use client"

import {
    PRODUCT_BACKLOG_PRIORITY_OPTIONS,
    PRODUCT_BACKLOG_STATUS_OPTIONS,
    type ProjectRole
} from "@/constants/constants"
import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { User } from "@/domain/entities/user"
import { useAssignBacklogUser } from "@/shared/hooks/use-assign-backlog-user"
import { useDeleteBacklog } from "@/shared/hooks/use-delete-backlog"
import { useEditBacklogGoal } from "@/shared/hooks/use-edit-backlog-goal"
import { useEditBacklogPoint } from "@/shared/hooks/use-edit-backlog-point"
import { useEditBacklogPriority } from "@/shared/hooks/use-edit-backlog-priority"
import { useEditBacklogStatus } from "@/shared/hooks/use-edit-backlog-status"
import { useEditBacklogTitle } from "@/shared/hooks/use-edit-backlog-title"
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
    onDeleteBacklog: (backlog: ProductBacklog) => void
    onEditBacklog: (backlogId: string) => void
}

export function BacklogItem(props: BacklogItemProps) {
    const navigate = useNavigate()

    const [assignee, setAssignee] = useState<User | null>(null)
    const [isEditingPoint, setIsEditingPoint] = useState(false)
    const [pointValue, setPointValue] = useState(props.backlog.point ?? 0)
    const [isHoveringTitle, setIsHoveringTitle] = useState(false)
    const [editingTitleBacklog, setEditingTitleBacklog] = useState<ProductBacklog>()
    const [titleValue, setTitleValue] = useState(props.backlog.title)
    const [isHoveringItem, setIsHoveringItem] = useState(false)

    const { triggerDeleteBacklog } = useDeleteBacklog(props.backlog.id)
    const { triggerEditBacklogPoint } = useEditBacklogPoint()
    const { triggerEditBacklogStatus } = useEditBacklogStatus()
    const { triggerEditBacklogPriority } = useEditBacklogPriority()
    const { triggerEditBacklogTitle } = useEditBacklogTitle()
    const { triggerEditBacklogGoal } = useEditBacklogGoal()
    const { triggerAssignBacklogUser } = useAssignBacklogUser()
    const { triggerGetProjectMembers } = useGetProjectMembers(props.backlog.projectId)

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
                isEmailVerified: false, // default/fake value or derive from dto if available
                isUserFirstTime: false  // same as above
            }))

            setMembers(uniqueUsers)
        }
        fetch()
    }, [props.backlog.projectId])

    useEffect(() => {
        if (props.backlog.assigneeId) {
            const found = members.find((m) => m.id === props.backlog.assigneeId)
            if (found) setAssignee(found)
        }
    }, [props.backlog.assigneeId, members])

    const handlePointSubmit = async () => {
        await triggerEditBacklogPoint({ backlogId: props.backlog.id, point: pointValue })
        setIsEditingPoint(false)
        props.onEditBacklog(props.backlog.id)
        toast.success("Backlog point updated successfully!")
    }

    const handleTitleSubmit = async () => {
        await triggerEditBacklogTitle({ backlogId: props.backlog.id, title: titleValue })
        toast.success("Backlog title updated successfully!")
        setEditingTitleBacklog(undefined)
        props.onEditBacklog(props.backlog.id)
    }

    const handleProductGoalChange = async (goalId: string | null) => {
        await triggerEditBacklogGoal({ backlogId: props.backlog.id, goalId })
        props.onEditBacklog(props.backlog.id)
        toast.success("Product goal updated successfully!")
    }


    return (
        <Card
            className="py-0 mb-2 hover:shadow-md transition-shadow rounded-md"
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
                        {!editingTitleBacklog || editingTitleBacklog.id !== props.backlog.id ? (
                            <div className="flex items-center gap-1 truncate">
                                <p className="text-sm truncate">{props.backlog.title}</p>
                                {isHoveringTitle && (
                                    <Pencil
                                        className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary"
                                        onClick={() => {
                                            setTitleValue(props.backlog.title)
                                            setEditingTitleBacklog(props.backlog)
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
                            projectId={props.backlog.projectId}
                            onSelectGoal={handleProductGoalChange}
                            selectedGoalId={props.backlog.productGoalId}
                            title="Select product goal"
                        />
                    </div>

                    <div className="flex justify-center">
                        <AssigneeSelector
                            projectId={props.backlog.projectId}
                            selectedAssignee={assignee}
                            onSelectAssignee={async (user) => {
                                await triggerAssignBacklogUser({ backlogId: props.backlog.id, assigneeId: user.id })
                                setAssignee(user)
                                toast.success("Assignee updated")
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
                                        {props.backlog.point}
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
                            <DropdownMenuTrigger className={`w-full cursor-pointer flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(props.backlog.priority)}`}>
                                <span>{getPriorityLabel(props.backlog.priority)}</span>
                                <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 mt-1 rounded-sm p-0">
                                {PRODUCT_BACKLOG_PRIORITY_OPTIONS.map(priority => (
                                    <DropdownMenuItem
                                        key={priority}
                                        onClick={async () => {
                                            if (priority !== props.backlog.priority) {
                                                await triggerEditBacklogPriority({ backlogId: props.backlog.id, priority })
                                                props.onEditBacklog(props.backlog.id)
                                                toast.success("Priority updated successfully!")
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
                            <DropdownMenuTrigger className={`w-full cursor-pointer flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(props.backlog.status)}`}>
                                <span>{getStatusLabel(props.backlog.status)}</span>
                                <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 mt-1 rounded-sm p-0">
                                {PRODUCT_BACKLOG_STATUS_OPTIONS.map(status => (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={async () => {
                                            if (status !== props.backlog.status) {
                                                await triggerEditBacklogStatus({ backlogId: props.backlog.id, status })
                                                props.onEditBacklog(props.backlog.id)
                                                toast.success("Status updated successfully!")
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
                                search.set("backlogId", props.backlog.id)
                                navigate({ search: search.toString() }, { replace: true })
                            }}
                        />
                        <Trash2
                            className="w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer"
                            onClick={() =>
                                triggerDeleteBacklog()
                                    .then(() => props.onDeleteBacklog(props.backlog))
                                    .catch(console.error)
                            }
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
