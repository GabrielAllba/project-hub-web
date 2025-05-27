import type { UpdateProductBacklogPositionRequestDTO } from "@/domain/dto/req/update-product-backlog-position-req";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class ReorderProductBacklogUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, data: UpdateProductBacklogPositionRequestDTO): Promise<BaseResponse<void>> {
        return this.projectHubRepo.reorderProductBacklog(token, projectId, data);
    }
}