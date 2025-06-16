import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProjectBacklogSummaryResponseDTO } from "@/domain/dto/res/project-backlog-summary-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectBacklogSummaryUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string): Promise<BaseResponse<ProjectBacklogSummaryResponseDTO>> {
        return await this.projectHubRepo.getProjectBacklogSummary(token, projectId);
    }
}