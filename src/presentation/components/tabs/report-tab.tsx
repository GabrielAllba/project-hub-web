"use client"
import { CHART_COLORS, getMockBacklogItems, getMockUsers } from "@/constants/constants"
import type { Sprint } from "@/domain/entities/sprint"
import type { SprintReport, UserPointsData } from "@/domain/entities/sprint-report"
import { useState } from "react"
import { LoadingState } from "../card/loading-state"
import { PointsDistributionChart } from "../chart/points-distribution-chart"
import { SprintSearchPopover } from "../dialog/sprint-search-popover"
import { EmptyState } from "../section/empty-state"
import { SprintOverview } from "../section/sprint-overview"
import { TaskAssignmentsTable } from "../table/task-assignment-table"
import { Badge } from "../ui/badge"

interface ReportTabProps {
    projectId: string
}

export const ReportTab = ({ projectId }: ReportTabProps) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
    const [sprintReport, setSprintReport] = useState<SprintReport | null>(null)
    const [loading, setLoading] = useState(false)



    const handleSprintSelect = async (sprint: Sprint) => {
        setSelectedSprint(sprint)
        setIsSearchOpen(false)
        setLoading(true)

        // Simulate API call to fetch sprint report
        setTimeout(() => {
            const mockUsers = getMockUsers()
            const mockBacklogItems = getMockBacklogItems(projectId, sprint.id)

            const completedItems = mockBacklogItems.filter((item) => item.status === "DONE")
            const inProgressItems = mockBacklogItems.filter((item) => item.status === "INPROGRESS")
            const todoItems = mockBacklogItems.filter((item) => item.status === "TODO")

            const totalPoints = mockBacklogItems.reduce((sum, item) => sum + item.point, 0)
            const completedPoints = completedItems.reduce((sum, item) => sum + item.point, 0)

            // Calculate user points data
            const userPointsMap = new Map<string, UserPointsData>()

            mockUsers.forEach((user, index) => {
                const userTasks = mockBacklogItems.filter((item) => item.assigneeId === user.id)
                const userCompletedPoints = userTasks
                    .filter((task) => task.status === "DONE")
                    .reduce((sum, task) => sum + task.point, 0)
                const userInProgressPoints = userTasks
                    .filter((task) => task.status === "INPROGRESS")
                    .reduce((sum, task) => sum + task.point, 0)
                const userTodoPoints = userTasks
                    .filter((task) => task.status === "TODO")
                    .reduce((sum, task) => sum + task.point, 0)
                const userTotalPoints = userTasks.reduce((sum, task) => sum + task.point, 0)

                if (userTotalPoints > 0) {
                    userPointsMap.set(user.id, {
                        name: user.username,
                        totalPoints: userTotalPoints,
                        donePoints: userCompletedPoints,
                        inProgressPoints: userInProgressPoints,
                        todoPoints: userTodoPoints,
                        color: CHART_COLORS[index % CHART_COLORS.length],
                    })
                }
            })

            // Add unassigned tasks
            const unassignedTasks = mockBacklogItems.filter((item) => !item.assigneeId)
            if (unassignedTasks.length > 0) {
                const unassignedPoints = unassignedTasks.reduce((sum, task) => sum + task.point, 0)
                userPointsMap.set("unassigned", {
                    name: "Unassigned",
                    totalPoints: unassignedPoints,
                    donePoints: 0,
                    inProgressPoints: 0,
                    todoPoints: unassignedPoints,
                    color: "#6b7280",
                })
            }

            const userPointsData = Array.from(userPointsMap.values())

            const mockReport: SprintReport = {
                sprint,
                backlogItems: mockBacklogItems,
                users: mockUsers,
                totalTask: mockBacklogItems.length,
                doneTask: completedItems.length,
                inProgressTask: inProgressItems.length,
                todoTask: todoItems.length,
                totalTaskPoints: totalPoints,
                doneTaskPoints: completedPoints,
                userPointsData: userPointsData,
            }
            setSprintReport(mockReport)
            setLoading(false)
        }, 1000)
    }

    const completionPercentage = sprintReport
        ? Math.round((sprintReport.doneTaskPoints / sprintReport.totalTaskPoints) * 100)
        : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Sprint Reports</h2>
                    {selectedSprint && (
                        <Badge variant="secondary" className="text-sm rounded-sm">
                            {selectedSprint.name}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Search Sprint Section */}
            <SprintSearchPopover
                projectId={projectId}
                isOpen={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSprint={selectedSprint}
                onSprintSelect={handleSprintSelect}
            />

            {/* Loading State */}
            {loading && <LoadingState />}

            {/* Sprint Report */}
            {sprintReport && !loading && (
                <div className="space-y-6">
                    <SprintOverview sprintReport={sprintReport} completionPercentage={completionPercentage} />
                    <PointsDistributionChart userPointsData={sprintReport.userPointsData} />
                    <TaskAssignmentsTable backlogItems={sprintReport.backlogItems} users={sprintReport.users} />
                </div>
            )}

            {/* Empty State */}
            {!selectedSprint && !loading && <EmptyState />}
        </div>
    )
}
