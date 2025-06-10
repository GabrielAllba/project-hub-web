"use client"

import { PRODUCT_BACKLOG_PRIORITY_OPTIONS, PRODUCT_BACKLOG_STATUS_OPTIONS } from "@/constants/constants"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { ProductGoal } from "@/domain/entities/product-goal"
import type { User } from "@/domain/entities/user"
import { useDeleteBacklog } from "@/shared/hooks/use-delete-backlog"
import { useEditBacklogPoint } from "@/shared/hooks/use-edit-backlog-point"
import { useEditBacklogPriority } from "@/shared/hooks/use-edit-backlog-priority"
import { useEditBacklogStatus } from "@/shared/hooks/use-edit-backlog-status"
import { useEditBacklogTitle } from "@/shared/hooks/use-edit-backlog-title"
import { useFindUser } from "@/shared/hooks/use-find-user"
import { useGetProductGoal } from "@/shared/hooks/use-get-product-goal"
import {
    getPriorityColor,
    getPriorityLabel,
    getStatusColor,
    getStatusLabel,
} from "@/shared/utils/product-backlog-utils"
import { Bolt, Check, ChevronDown, Eye, GripVertical, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ProductGoalModal } from "../modal/product-goal-modal"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface BacklogItemProps {
    id: string
    backlog: ProductBacklog
    onDeleteBacklog: (backlog: ProductBacklog) => void
    onEditBacklog: (backlogId: string) => void
}

export function BacklogItem(props: BacklogItemProps) {
    const { triggerFindUser } = useFindUser()
    const [assignee, setAssignee] = useState<User | null>(null)
    const [isEditingPoint, setIsEditingPoint] = useState(false)
    const [pointValue, setPointValue] = useState(props.backlog.point ?? 0)
    const [isHoveringTitle, setIsHoveringTitle] = useState(false)
    const [editingTitleBacklog, setEditingTitleBacklog] = useState<ProductBacklog>()
    const [titleValue, setTitleValue] = useState(props.backlog.title)
    const [isProductGoalModalOpen, setIsProductGoalModalOpen] = useState(false)
    const [selectedProductGoal, setSelectedProductGoal] = useState<ProductGoal | null>(null)
    const [isHoveringItem, setIsHoveringItem] = useState(false)


    const { triggerDeleteBacklog } = useDeleteBacklog(props.backlog.id)
    const { triggerEditBacklogPoint } = useEditBacklogPoint()
    const { triggerEditBacklogStatus } = useEditBacklogStatus()
    const { triggerEditBacklogPriority } = useEditBacklogPriority()
    const { triggerEditBacklogTitle } = useEditBacklogTitle()
    const { triggerGetProductGoal } = useGetProductGoal(props.backlog.projectId)

    useEffect(() => {
        if (props.backlog.assigneeId) {
            triggerFindUser(props.backlog.assigneeId).then((res) => {
                setAssignee(res.data)
            })
        }

        // Fetch product goal if backlog has one
        if (props.backlog.productGoalId) {
            fetchProductGoal(props.backlog.productGoalId)
        }
    }, [props.id, props.backlog.productGoalId])

    const fetchProductGoal = async (goalId: string) => {
        try {
            // This is a simplified approach - you might need to adjust based on your API
            const response = await triggerGetProductGoal(props.backlog.projectId, 0, 100)
            const goal = response.data.content.find((g) => g.id === goalId)
            if (goal) {
                setSelectedProductGoal(goal)
            }
        } catch (error) {
            console.error("Failed to fetch product goal:", error)
        }
    }

    const handlePointSubmit = async () => {
        await triggerEditBacklogPoint({
            backlogId: props.backlog.id,
            point: pointValue,
        })
        setIsEditingPoint(false)
        props.onEditBacklog(props.backlog.id)
        toast.success("Backlog point updated successfully!")
    }

    const handleTitleSubmit = async () => {
        await triggerEditBacklogTitle({
            backlogId: props.backlog.id,
            title: titleValue
        })
        toast.success("Backlog title updated successfully!")
        setEditingTitleBacklog(undefined)
        props.onEditBacklog(props.backlog.id)
    }

    const handleProductGoalChange = async (goalId: string | null) => {
        try {
            if (goalId) {
                fetchProductGoal(goalId)
            } else {
                setSelectedProductGoal(null)
            }

            props.onEditBacklog(props.backlog.id)
            toast.success("Product goal updated successfully!")
        } catch (error) {
            console.error("Failed to update product goal:", error)
            toast.error("Failed to update product goal")
        }
    }

    return (
        <Card
            className="py-0 mb-2 hover:shadow-md transition-shadow rounded-md"
            onMouseEnter={() => setIsHoveringItem(true)}
            onMouseLeave={() => setIsHoveringItem(false)}
        >
            <CardContent className="p-2">
                <div className="grid grid-cols-[24px_1fr_144px_32px_48px_112px_112px_64px] items-center gap-2 w-full">
                    {/* Drag Handle */}
                    <div className="flex justify-center cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Title */}
                    <div
                        className="min-w-0 flex items-center gap-1"
                        onMouseEnter={() => setIsHoveringTitle(true)}
                        onMouseLeave={() => setIsHoveringTitle(false)}
                    >
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
                            <div className="relative w-full flex items-center gap-1">
                                <Input
                                    value={titleValue}
                                    onChange={(e) => setTitleValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleTitleSubmit()
                                        if (e.key === "Escape") {
                                            setTitleValue(props.backlog.title)
                                            setEditingTitleBacklog(undefined)
                                        }
                                    }}
                                    autoFocus
                                    className="text-sm h-7 pr-16 rounded-sm"
                                />
                                <div className="absolute right-0 top-full mt-2 flex space-x-1">
                                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm" onClick={handleTitleSubmit}>
                                        <Check className="w-3 h-3" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm" onClick={() => setEditingTitleBacklog(undefined)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Product Goal Button */}
                    {/* Product Goal */}
                    <div className="flex justify-center items-center">
                        {selectedProductGoal ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="outline"
                                        className="flex items-center 
                                        gap-1 rounded-sm text-xs text-purple-600 bg-purple-100 border-purple-500 px-2 py-0.5 cursor-pointer hover:bg-purple-50"
                                        onClick={() => setIsProductGoalModalOpen(true)}
                                    >
                                        <Bolt className="h-4 w-4 text-purple-500" />
                                        <p className="max-w-[96px] truncate font-semibold">
                                            {selectedProductGoal.title}
                                        </p>
                                    </Badge>

                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{selectedProductGoal.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            isHoveringItem && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs flex items-center gap-1"
                                    onClick={() => setIsProductGoalModalOpen(true)}
                                >
                                    Goal
                                </Button>
                            )
                        )}

                        <ProductGoalModal
                            open={isProductGoalModalOpen}
                            onOpenChange={setIsProductGoalModalOpen}
                            projectId={props.backlog.projectId}
                            onSelectGoal={handleProductGoalChange}
                            selectedGoalId={props.backlog.productGoalId || null}
                            title="Select product goal"
                        />
                    </div>

                    {/* Assignee */}
                    <div className="flex justify-center">
                        <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-gray-300 text-white text-xs">
                                {assignee?.username?.charAt(0).toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Point */}
                    <div className="flex justify-center">
                        {!isEditingPoint ? (
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setIsEditingPoint(true)}>
                                        {props.backlog.point}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Points</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <div className="flex items-center gap-1 relative">
                                <Input
                                    type="number"
                                    value={pointValue}
                                    onChange={(e) => setPointValue(Number(e.target.value))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handlePointSubmit()
                                        if (e.key === "Escape") {
                                            setPointValue(props.backlog.point)
                                            setIsEditingPoint(false)
                                        }
                                    }}
                                    className="h-6 w-14 rounded-sm text-xs"
                                    autoFocus
                                />
                                <div className="absolute right-0 top-full mt-2 flex space-x-1">
                                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm" onClick={handlePointSubmit}>
                                        <Check className="w-3 h-3" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm" onClick={() => setIsEditingPoint(false)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className={`w-full cursor-pointer flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(props.backlog.priority)}`}
                            >
                                <span>{getPriorityLabel(props.backlog.priority)}</span>
                                <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 mt-1 rounded-sm p-0">
                                {PRODUCT_BACKLOG_PRIORITY_OPTIONS.map((priority) => (
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

                    {/* Status */}
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className={`w-full cursor-pointer flex items-center justify-between gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(props.backlog.status)}`}
                            >
                                <span>{getStatusLabel(props.backlog.status)}</span>
                                <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 mt-1 rounded-sm p-0">
                                {PRODUCT_BACKLOG_STATUS_OPTIONS.map((status) => (
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

                    {/* Actions */}
                    <div className="flex justify-end gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        <Trash2
                            className="w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer"
                            onClick={() =>
                                triggerDeleteBacklog().then(() => props.onDeleteBacklog(props.backlog)).catch(console.error)
                            }
                        />
                    </div>
                </div>
            </CardContent>
        </Card >

    )
}
