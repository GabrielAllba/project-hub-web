export type ProductBacklogPriority = "HIGH" | "MEDIUM" | "LOW"
export type ProductBacklogStatus = "TODO" | "INPROGRESS" | "DONE"

export interface ProductBacklog  {
  id: string
  projectId: string
  point: number;
  sprintId: string | null;
  productGoalId: string | null;
  title: string
  priority: ProductBacklogPriority
  status: ProductBacklogStatus
  creatorId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string

}