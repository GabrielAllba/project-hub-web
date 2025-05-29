export interface MoveBacklogToSprintRequestDTO {
  backlogId: string;
  sprintId: string;
  beforeId?: string | null;
}
