export type ProductBacklogPriority = "HIGH" | "MEDIUM" | "LOW"
export type ProductBacklogStatus = "TODO" | "IN_PROGRESS" | "DONE"

export interface ProductBacklog  {
  id: string
  projectId: string
  sprintId: string | null;
  title: string
  priority: ProductBacklogPriority
  status: ProductBacklogStatus
  creatorId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string

}

export interface ProductBacklogWithContainer extends ProductBacklog {
  containerId: string
}
