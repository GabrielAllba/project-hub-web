import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog"

export interface GetMyActiveBacklogResponseDTO {
    id: string
    prevBacklogId: string | null
    projectId: string
    projectName: string
    sprintId: string
    sprintName: string
    productGoalId?: string | null
    productGoalTitle?: string | null
    point: number
    title: string
    priority: ProductBacklogPriority
    status: ProductBacklogStatus
    creatorId: string
    assigneeId: string
    createdAt: string
    updatedAt: string
}
