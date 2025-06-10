import type { ProductBacklogStatus } from "@/domain/entities/product-backlog";

export interface EditBacklogStatusRequestDTO {
    backlogId: string;
    status: ProductBacklogStatus
}
