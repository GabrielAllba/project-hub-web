export interface UpdateProductBacklogPositionRequestDTO {
    backlogId: string;
    prevBacklogId: string | null;
    nextBacklogId: string | null;
}
