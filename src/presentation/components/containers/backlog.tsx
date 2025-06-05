import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { User } from "@/domain/entities/user";
import { useDeleteBacklog } from "@/shared/hooks/use-delete-backlog";
import { useFindUser } from "@/shared/hooks/use-find-user";
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from "@/shared/utils/product-backlog-utils";
import { Eye, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface BacklogProps {
    id: string
    backlog: ProductBacklog
    onDeleteBacklog: (backlog: ProductBacklog) => void;
}

export function Backlog(props: BacklogProps) {
    const { triggerFindUser } = useFindUser()


    const [assignee, setAssignee] = useState<User | null>(null)

    useEffect(() => {
        if (props.backlog.assigneeId) {
            triggerFindUser(props.backlog.assigneeId).then((res) => {
                setAssignee(res.data)
            })
        }
    }, [props.id])


    const {
        triggerDeleteBacklog
    } = useDeleteBacklog(props.backlog.id)

    return (
        <Card className="py-1 mb-2 hover:shadow-md transition-shadow rounded-sm">
            <CardContent className="p-1">
                <div className="flex items-center gap-4 w-full">
                    <div
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                    >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                        <div className="font-medium text-sm truncate">{props.backlog.title}</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-gray-300 text-white">
                                {assignee?.username?.charAt(0).toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
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
                                    .then(() => {
                                        props.onDeleteBacklog(props.backlog)
                                    })
                                    .catch((error) => {
                                        console.error("Error deleting backlog:", error)
                                    })
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
