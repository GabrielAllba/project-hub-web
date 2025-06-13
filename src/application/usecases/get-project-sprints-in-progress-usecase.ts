import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectSprintsInProgressUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, page: number, size: number): Promise<BaseResponse<Page<SprintResponseDTO>>> {
        return await this.projectHubRepo.getProjectSprintsInProgress(token, projectId, page, size);
    }
}