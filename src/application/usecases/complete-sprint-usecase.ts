import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class CompleteSprintUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, sprintId: string): Promise<BaseResponse<SprintResponseDTO>> {
        return this.projectHubRepo.completeSprint(token, sprintId);
    }
}