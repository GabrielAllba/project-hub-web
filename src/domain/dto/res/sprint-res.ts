import type { SprintStatus } from "@/domain/entities/sprint";

export interface SprintResponseDTO {
  id: string;
  projectId: string;
  name: string;
  sprintGoal:string;
  startDate: string;
  status: SprintStatus;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}
