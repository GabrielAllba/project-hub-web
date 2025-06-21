import type { BaseResponse } from "@/domain/dto/base-response";
import type { SprintOverviewResponseDTO } from "@/domain/dto/res/sprint-overview-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetSprintOverviewseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, sprintId: string): Promise<BaseResponse<SprintOverviewResponseDTO>> {
        return await this.projectHubRepo.getSprintOverview(token, sprintId);
    }
}