import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";
import { type EditBacklogPointRequestDTO } from '../../domain/dto/req/edit-backlog-point-req';

export class EditBacklogPointUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: EditBacklogPointRequestDTO): Promise<BaseResponse<ProductBacklog>> {
        return this.projectHubRepo.editBacklogPoint(token, data);
    }
}