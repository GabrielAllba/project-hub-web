import type { BaseResponse } from "@/domain/dto/base-response";
import type { UserWorkItemSummaryResponseDTO } from "@/domain/dto/res/user-work-item-summary-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectWorkSummaryUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, range: string): Promise<BaseResponse<UserWorkItemSummaryResponseDTO[]>> {
        return await this.projectHubRepo.getProjectWorkSummary(token, projectId, range);
    }
}