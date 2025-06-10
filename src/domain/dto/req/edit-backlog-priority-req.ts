import type { ProductBacklogPriority } from "@/domain/entities/product-backlog";

export interface EditBacklogPriorityRequestDTO {
    backlogId: string;
    priority: ProductBacklogPriority
}
