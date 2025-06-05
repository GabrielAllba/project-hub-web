import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { User } from "@/domain/entities/user";
import { useDeleteBacklog } from "@/shared/hooks/use-delete-backlog";
import { useEditBacklogPoint } from "@/shared/hooks/use-edit-backlog-point";
import { useFindUser } from "@/shared/hooks/use-find-user";
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from "@/shared/utils/product-backlog-utils";
import { Check, Eye, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface BacklogProps {
    id: string
    backlog: ProductBacklog
    onDeleteBacklog: (backlog: ProductBacklog) => void;
    onEditBacklogPoint: () => void
}

export function Backlog(props: BacklogProps) {
    const { triggerFindUser } = useFindUser()
    const [assignee, setAssignee] = useState<User | null>(null)
    const [isEditingPoint, setIsEditingPoint] = useState(false)
    const [pointValue, setPointValue] = useState(props.backlog.point ?? 0)

    const { triggerDeleteBacklog } = useDeleteBacklog(props.backlog.id)
    const { triggerEditBacklogPoint } = useEditBacklogPoint()

    useEffect(() => {
        if (props.backlog.assigneeId) {
            triggerFindUser(props.backlog.assigneeId).then((res) => {
                setAssignee(res.data)
            })
        }
    }, [props.id])


    const handlePointSubmit = async () => {
        await triggerEditBacklogPoint({
            backlogId: props.backlog.id,
            point: pointValue
        })
        setIsEditingPoint(false)
        props.onEditBacklogPoint()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePointSubmit()
        } else if (e.key === 'Escape') {
            setPointValue(props.backlog.point)
            setIsEditingPoint(false)
        }
    }

    return (
        <Card className="py-1 mb-2 hover:shadow-md transition-shadow rounded-sm">
            <CardContent className="p-1">
                <div className="flex items-center gap-4 w-full">
                    <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                        <div className="font-medium text-sm truncate">{props.backlog.title}</div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 items-center justify-items-end">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-gray-300 text-white">
                                    {assignee?.username?.charAt(0).toUpperCase() ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                            {!isEditingPoint ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs hover:cursor-pointer"
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
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        value={pointValue}
                                        onChange={(e) => setPointValue(Number(e.target.value))}
                                        onKeyDown={handleKeyDown}
                                        className="h-6 w-16 rounded-sm"
                                        autoFocus
                                    />
                                    <Check
                                        className="w-4 h-4 text-green-500 hover:cursor-pointer"
                                        onClick={handlePointSubmit}
                                    />
                                    <X
                                        className="w-4 h-4 text-red-500 hover:cursor-pointer"
                                        onClick={() => {
                                            setPointValue(props.backlog.point)
                                            setIsEditingPoint(false)
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <Badge className={`text-xs ${getPriorityColor(props.backlog.priority)}`}>
                            {getPriorityLabel(props.backlog.priority)}
                        </Badge>

                        <Badge className={`text-xs ${getStatusColor(props.backlog.status)}`}>
                            {getStatusLabel(props.backlog.status)}
                        </Badge>

                        <div className="flex gap-2">
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                            <Trash2
                                className="w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer"
                                onClick={() => {
                                    triggerDeleteBacklog()
                                        .then(() => props.onDeleteBacklog(props.backlog))
                                        .catch((error) => console.error("Error deleting backlog:", error))
                                }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
