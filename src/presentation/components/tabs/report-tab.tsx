"use client"

import type { Sprint } from "@/domain/entities/sprint"
import { useGetSprintById } from "@/shared/hooks/use-get-sprint-by-id"
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { TasksDistributionChart } from "../chart/tasks-distribution-chart"
import { SprintSearchPopover } from "../dialog/sprint-search-popover"
import { EmptyStateIllustration } from "../empty/empty-state"
import { EmptyState } from "../section/empty-state"
import { SprintOverview } from "../section/sprint-overview"
import { TaskAssignmentsTable } from "../table/task-assignment-table"

interface ReportTabProps {
    projectId: string
}

export const ReportTab = ({ projectId }: ReportTabProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
    const [sprintFetchFailed, setSprintFetchFailed] = useState(false)

    const sprintIdFromQuery = new URLSearchParams(location.search).get("sprintId")
    const { triggerGetSprintById } = useGetSprintById("")

    useEffect(() => {
        const fetchSprint = async () => {
            if (!sprintIdFromQuery) return

            try {
                const res = await triggerGetSprintById(sprintIdFromQuery)
                if (res.status === "success" && res.data) {
                    setSelectedSprint(res.data)
                    setSprintFetchFailed(false)
                } else {
                    setSprintFetchFailed(true)
                    toast.error("Failed to load sprint", {
                        description: res.message,
                    })
                }
            } catch (err) {
                setSprintFetchFailed(true)
                toast.error("Unexpected error while fetching sprint: " + err)
            }
        }

        fetchSprint()
    }, [sprintIdFromQuery])

    const handleSprintSelect = (sprint: Sprint) => {
        setSelectedSprint(sprint)
        setSprintFetchFailed(false)
        setIsSearchOpen(false)
        navigate(`?tab=report&sprintId=${sprint.id}`, { replace: true })
    }


    return (
        <div className="space-y-6">
            <SprintSearchPopover
                projectId={projectId}
                isOpen={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSprint={selectedSprint}
                onSprintSelect={handleSprintSelect}
            />

            {selectedSprint ? (
                <div className="space-y-6">
                    <SprintOverview sprintId={selectedSprint.id} />
                    <TasksDistributionChart sprintId={selectedSprint.id} />
                    <TaskAssignmentsTable sprintId={selectedSprint.id} />
                </div>
            ) : sprintIdFromQuery && sprintFetchFailed ? (
                <EmptyStateIllustration type="no-sprints" />
            ) : (
                <EmptyState />
            )}
        </div>
    )
}
