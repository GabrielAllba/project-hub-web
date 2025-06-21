import type { RenameProjectRequestDTO } from "@/domain/dto/req/rename-project-req";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class RenameProjectUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: RenameProjectRequestDTO): Promise<BaseResponse<ProjectSummary>> {
        return this.projectHubRepo.renameProject(token, data);
    }
}