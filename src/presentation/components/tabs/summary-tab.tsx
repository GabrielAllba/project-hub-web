"use client"

import { useGetProjectBacklogSummary } from "@/shared/hooks/use-get-project-backlog-summary"
import { useEffect } from "react"
import { StatusCards } from "../card/status-cards"
import { ChartAreaInteractive } from "../chart/chart-area-interactive"
import { SummaryTabSkeleton } from "../loading/summary-tab-skeleton"

interface SummaryTabProps {
    projectId: string
}

export const SummaryTab = ({ projectId }: SummaryTabProps) => {
    const {
        triggerGetProjectBacklogSummary,
        triggerGetProjectBacklogSummaryResponse,
        triggerGetProjectBacklogSummaryLoading,
        triggerGetProjectBacklogSummaryError
    } = useGetProjectBacklogSummary(projectId)

    const loadData = async () => {
        await triggerGetProjectBacklogSummary()
    }

    useEffect(() => {
        loadData()
    }, [projectId])

    if (triggerGetProjectBacklogSummaryLoading || !triggerGetProjectBacklogSummaryResponse) {
        return <SummaryTabSkeleton />
    }
    return (
        <div className="space-y-6">
            <StatusCards
                inProgress={triggerGetProjectBacklogSummaryResponse?.data.totalInProgress}
                completed={triggerGetProjectBacklogSummaryResponse?.data.totalDone}
                todo={triggerGetProjectBacklogSummaryResponse?.data.totalTodo}
                isLoading={triggerGetProjectBacklogSummaryLoading}
                isError={triggerGetProjectBacklogSummaryError}
            />

            <div className="grid grid-cols-1 gap-6">
                <ChartAreaInteractive projectId={projectId} />
            </div>
        </div>
    )
}
