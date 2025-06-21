"use client"

import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Flag,
    Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import type { User } from "@/domain/entities/user"
import { useFindUser } from "@/shared/hooks/use-find-user"
import { useGetProductBacklogBySprint } from "@/shared/hooks/use-get-product-backlog-by-sprint"
import {
    getPriorityColor,
    getStatusColor,
    getStatusLabel,
} from "@/shared/utils/product-backlog-utils"

interface TaskAssignmentsTableProps {
    sprintId: string
}

export const TaskAssignmentsTable = ({ sprintId }: TaskAssignmentsTableProps) => {
    const [backlogItems, setBacklogItems] = useState<ProductBacklog[]>([])
    const [assignees, setAssignees] = useState<Record<string, User>>({})
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
    const [hasMore, setHasMore] = useState(true)

    const {
        triggerGetProductBacklogBySprint,
        triggerGetProductBacklogBySprintLoading,
    } = useGetProductBacklogBySprint(sprintId)

    const { triggerFindUser } = useFindUser()

    useEffect(() => {
        setBacklogItems([])
        setAssignees({})
        setCurrentPage(DEFAULT_PAGE)
        setHasMore(true)
    }, [sprintId])

    useEffect(() => {
        const loadBacklogItems = async () => {
            try {
                const response = await triggerGetProductBacklogBySprint(
                    sprintId,
                    currentPage,
                    DEFAULT_PAGE_SIZE
                )

                if (response?.data.content) {
                    const newItems = response.data.content
                    const combined = [...backlogItems, ...newItems]

                    const uniqueItemsMap = new Map<string, ProductBacklog>()
                    combined.forEach((item) => uniqueItemsMap.set(item.id, item))

                    setBacklogItems(Array.from(uniqueItemsMap.values()))
                    setHasMore(newItems.length === DEFAULT_PAGE_SIZE)
                } else {
                    setHasMore(false)
                }
            } catch (error) {
                console.error("Failed to load product backlog items:", error)
                setHasMore(false)
            }
        }

        if (sprintId) {
            loadBacklogItems()
        }
    }, [currentPage, sprintId])

    useEffect(() => {
        const fetchAssignees = async () => {
            const uniqueAssigneeIds = Array.from(
                new Set(backlogItems.map((item) => item.assigneeId).filter(Boolean))
            ) as string[]

            const newAssignees: Record<string, User> = {}

            for (const id of uniqueAssigneeIds) {
                if (!assignees[id]) {
                    try {
                        const user = await triggerFindUser(id)
                        if (user?.data) {
                            newAssignees[id] = {
                                id: user.data.id,
                                email: user.data.email,
                                username: user.data.username,
                            }
                        }
                    } catch (error) {
                        console.error(`Failed to fetch user with ID ${id}:`, error)
                    }
                }
            }

            if (Object.keys(newAssignees).length > 0) {
                setAssignees((prev) => ({ ...prev, ...newAssignees }))
            }
        }

        if (backlogItems.length > 0) {
            fetchAssignees()
        }
    }, [backlogItems, triggerFindUser, assignees])

    const handleLoadMore = () => {
        setCurrentPage((prev) => prev + 1)
    }

    return (
        <Card className="rounded-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Task Assignments
                </CardTitle>
                <CardDescription>
                    Detailed breakdown of all tasks and their assignments in this sprint
                </CardDescription>
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
                            const assignee = item.assigneeId ? assignees[item.assigneeId] : null

                            return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="max-w-md">
                                            <p className="font-medium">{item.title}</p>
                                            
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                            {item.point}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={`${getPriorityColor(item.priority)} rounded-sm`}
                                        >
                                            <Flag className="w-3 h-3 mr-1" />
                                            {item.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={`${getStatusColor(item.status)} rounded-sm`}
                                        >
                                            {item.status === "DONE" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {item.status === "INPROGRESS" && <Clock className="w-3 h-3 mr-1" />}
                                            {item.status === "TODO" && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {getStatusLabel(item.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {assignee ? (
                                            <div className="flex items-center justify-center gap-2">
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

                {hasMore && (
                    <div className="flex justify-center mt-4">
                        <Button
                            onClick={handleLoadMore}
                            disabled={triggerGetProductBacklogBySprintLoading}
                            variant="outline"
                            size="sm"
                        >
                            {triggerGetProductBacklogBySprintLoading ? "Loading..." : "Load More"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
