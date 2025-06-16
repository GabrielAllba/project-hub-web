import { AlertCircle, CheckCircle2, Clock, Flag, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { User } from "@/domain/entities/user"
import { getPriorityColor, getStatusColor, getStatusLabel } from "@/shared/utils/product-backlog-utils"

interface TaskAssignmentsTableProps {
    backlogItems: ProductBacklog[]
    users: User[]
}

export const TaskAssignmentsTable = ({ backlogItems, users }: TaskAssignmentsTableProps) => {
    const getUserById = (userId: string | null) => {
        if (!userId) return null
        return users.find((user) => user.id === userId)
    }

    return (
        <Card className="rounded-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Task Assignments
                </CardTitle>
                <CardDescription>Detailed breakdown of all tasks and their assignments in this sprint</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead className="text-center">Points</TableHead>
                            <TableHead className="text-center">Priority</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Assignee</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {backlogItems.map((item) => {
                            const assignee = getUserById(item.assigneeId)
                            return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="max-w-md">
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Created: {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="rounded-sm">
                                            {item.point}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`${getPriorityColor(item.priority)} rounded-sm`}>
                                            <Flag className="w-3 h-3 mr-1" />
                                            {item.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`${getStatusColor(item.status)} rounded-sm`}>
                                            {item.status === "DONE" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {item.status === "INPROGRESS" && <Clock className="w-3 h-3 mr-1" />}
                                            {item.status === "TODO" && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {getStatusLabel(item.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {assignee ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={"/placeholder.svg"} />
                                                    <AvatarFallback className="text-xs">
                                                        {assignee.username
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{assignee.username}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <span className="text-sm">Unassigned</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
