import type { CreateProductBacklogRequestDTO } from "@/domain/dto/req/create-product-backlog-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class CreateProductBacklogUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, data: CreateProductBacklogRequestDTO): Promise<BaseResponse<ProductBacklog>> {
        return this.projectHubRepo.createProductBacklog(token, projectId, data);
    }
}