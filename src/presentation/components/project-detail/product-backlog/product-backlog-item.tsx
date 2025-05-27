import type { ProductBacklogWithContainer } from "@/domain/entities/product-backlog"
import { formatDate, getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from "@/shared/utils/product-backlog-utils"
import { Eye, GripVertical, Pencil, Trash2 } from "lucide-react"
import type React from "react"
import { Badge } from "../../ui/badge"

interface ProductBacklogItemProps {
    productBacklog: ProductBacklogWithContainer
    dragHandleProps?: React.HTMLAttributes<HTMLElement> & React.DOMAttributes<HTMLElement>
    isDragging?: boolean
}

export const ProductBacklogItem = ({ productBacklog, dragHandleProps, isDragging = false }: ProductBacklogItemProps) => {
    return (
        <div
            className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${isDragging ? "shadow-lg" : ""
                }`}
        >
            <div className="flex items-center gap-4 w-full">
                <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1">
                    <div className="font-medium text-sm truncate">{productBacklog.title}</div>
                    <div className="text-xs text-muted-foreground">
                        Created: {formatDate(productBacklog.createdAt)}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">Assignee: {productBacklog.assigneeId || "Unassigned"}</div>
                </div>

                <Badge className={`text-xs ${getPriorityColor(productBacklog.priority)}`}>{getPriorityLabel(productBacklog.priority)}</Badge>

                <Badge className={`text-xs ${getStatusColor(productBacklog.status)}`}>{getStatusLabel(productBacklog.status)}</Badge>

                <div className="flex gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                    <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer" />
                </div>
            </div>
        </div>
    )
}
