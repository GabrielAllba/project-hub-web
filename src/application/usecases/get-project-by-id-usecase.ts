import type { BaseResponse } from "@/domain/dto/base-response";
import type { Project } from "@/domain/entities/project";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectByIdUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, ProjectId: string): Promise<BaseResponse<Project>> {
        return await this.projectHubRepo.getProjectById(token, ProjectId);
    }
}