import type { EditBacklogPriorityRequestDTO } from "@/domain/dto/req/edit-backlog-priority-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class EditBacklogPriorityUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: EditBacklogPriorityRequestDTO): Promise<BaseResponse<ProductBacklog>> {
        return this.projectHubRepo.editBacklogPriority(token, data);
    }
}