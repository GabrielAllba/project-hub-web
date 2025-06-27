export interface GetProductGoalByProjectResponseDTO {
    id: string
    projectId: string
    title: string
    createdAt: string
    updatedAt: string
    todoTask: number
    inProgressTask: number
    doneTask: number
}
