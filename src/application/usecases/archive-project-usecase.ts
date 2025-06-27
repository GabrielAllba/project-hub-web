import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class ArchiveProjectUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string): Promise<BaseResponse<void>> {
        return await this.projectHubRepo.archiveProject(token, projectId);
    }
}
