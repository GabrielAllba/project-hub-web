import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class DeleteProjectUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string): Promise<BaseResponse<void>> {
        return this.projectHubRepo.deleteProject(token, projectId);
    }
}