import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";
import type { EditBacklogTitleRequestDTO } from '../../domain/dto/req/edit-backlog-title-req';

export class EditBacklogTitleUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: EditBacklogTitleRequestDTO): Promise<BaseResponse<ProductBacklog>> {
        return this.projectHubRepo.editBacklogTitle(token, data);
    }
}