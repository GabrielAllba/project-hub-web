export type SprintStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

export interface Sprint {
  id: string
  projectId: string;
  name: string
  sprintGoal: string;
  startDate: string;
  status: SprintStatus;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}