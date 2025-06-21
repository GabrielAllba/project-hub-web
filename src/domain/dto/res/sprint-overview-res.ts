import type { SprintStatus } from "@/domain/entities/sprint"

export interface SprintOverviewResponseDTO {
    startDate: string
    endDate: string
    sprintGoal: string
    status: SprintStatus
    totalTasks: number
    completedTasks: number
    totalPoints: number
    completedPoints: number
}
