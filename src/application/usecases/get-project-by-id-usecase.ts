import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectByIdUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, ProjectId: string): Promise<BaseResponse<ProjectSummary>> {
        return await this.projectHubRepo.getProjectById(token, ProjectId);
    }
}