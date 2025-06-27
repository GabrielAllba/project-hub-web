import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetArchivedProjectsUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, page: number, size: number): Promise<BaseResponse<Page<ProjectSummary>>> {
        return await this.projectHubRepo.getArchivedProjects(token, page, size);
    }
}
