import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProductBacklogByIdUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, backlogId: string): Promise<BaseResponse<ProductBacklog>> {
        return await this.projectHubRepo.getProductBacklogById(token, backlogId);
    }
}