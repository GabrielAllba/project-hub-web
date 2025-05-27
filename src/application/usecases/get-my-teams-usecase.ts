import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { TeamSummary } from "@/domain/entities/team-summary";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetMyTeamsUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, page: number, size: number): Promise<BaseResponse<Page<TeamSummary>>> {
        return await this.projectHubRepo.getMyTeams(token, page, size);
    }
}