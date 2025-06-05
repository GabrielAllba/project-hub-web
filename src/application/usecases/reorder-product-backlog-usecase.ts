import type { ReorderProductBacklogRequestDTO } from "@/domain/dto/req/reorder-product-backlog-req";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class ReorderProductBacklogUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: ReorderProductBacklogRequestDTO): Promise<BaseResponse<void>> {
        return this.projectHubRepo.reorderProductBacklog(token, data);
    }
}