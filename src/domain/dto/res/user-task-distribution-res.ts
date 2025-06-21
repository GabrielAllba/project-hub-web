export interface UserTaskDistributionResponseDTO {
    userId: string
    name: string
    totalTasks: number
    doneTasks: number
    inProgressTasks: number
    todoTasks: number
}
