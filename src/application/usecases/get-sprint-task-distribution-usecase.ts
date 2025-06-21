import type { BaseResponse } from "@/domain/dto/base-response";
import type { UserTaskDistributionResponseDTO } from "@/domain/dto/res/user-task-distribution-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetSprintTaskDistributionseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, sprintId: string): Promise<BaseResponse<UserTaskDistributionResponseDTO[]>> {
        return await this.projectHubRepo.getSprintTaskDistribution(token, sprintId);
    }
}