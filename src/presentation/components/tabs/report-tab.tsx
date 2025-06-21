"use client"

import type { Sprint } from "@/domain/entities/sprint"
import { useState } from "react"
import { TasksDistributionChart } from "../chart/tasks-distribution-chart"
import { SprintSearchPopover } from "../dialog/sprint-search-popover"
import { EmptyState } from "../section/empty-state"
import { SprintOverview } from "../section/sprint-overview"
import { TaskAssignmentsTable } from "../table/task-assignment-table"

interface ReportTabProps {
    projectId: string
}

export const ReportTab = ({ projectId }: ReportTabProps) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)


    const handleSprintSelect = async (sprint: Sprint) => {
        setSelectedSprint(sprint)
        setIsSearchOpen(false)

    }

    return (
        <div className="space-y-6">
            {/* Sprint Search */}
            <SprintSearchPopover
                projectId={projectId}
                isOpen={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSprint={selectedSprint}
                onSprintSelect={handleSprintSelect}
            />


            {/* Sprint Report */}
            {selectedSprint && (
                <div className="space-y-6">
                    <SprintOverview
                        key={'sprint-overview-' + selectedSprint.id}
                        sprintId={selectedSprint.id} />
                    <TasksDistributionChart
                        key={'sprint-task-distribution-' + selectedSprint.id}
                        sprintId={selectedSprint.id} />
                    <TaskAssignmentsTable
                        key={'sprint-task-assignment-table-' + selectedSprint.id}
                        sprintId={selectedSprint.id} />
                </div>
            )}

            {/* Empty */}
            {!selectedSprint && <EmptyState />}
        </div>
    )
}
