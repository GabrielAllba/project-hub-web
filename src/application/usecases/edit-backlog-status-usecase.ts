import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";
import type { EditBacklogStatusRequestDTO } from '../../domain/dto/req/edit-backlog-status-req';

export class EditBacklogStatusUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: EditBacklogStatusRequestDTO): Promise<BaseResponse<ProductBacklog>> {
        return this.projectHubRepo.editBacklogStatus(token, data);
    }
}