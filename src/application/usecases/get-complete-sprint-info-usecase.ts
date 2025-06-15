import type { CompleteSprintInfoResponseDTO } from "@/domain/dto/res/complete-sprint-info-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class GetCompleteSprintInfoUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, sprintId: string): Promise<BaseResponse<CompleteSprintInfoResponseDTO>> {
        return this.projectHubRepo.getCompleteSprintInfo(token, sprintId);
    }
}