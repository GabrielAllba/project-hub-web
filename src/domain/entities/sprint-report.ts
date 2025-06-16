import type { ProductBacklog } from "./product-backlog"
import type { Sprint } from "./sprint"
import type { User } from "./user"

export interface UserPointsData {
    name: string
    totalPoints: number
    donePoints: number
    inProgressPoints: number
    todoPoints: number
    color: string
}

export interface SprintReport {
    sprint: Sprint
    backlogItems: ProductBacklog[]
    users: User[]
    totalTask: number
    doneTask: number
    inProgressTask: number
    todoTask: number
    totalTaskPoints: number
    doneTaskPoints: number
    userPointsData: UserPointsData[]
}