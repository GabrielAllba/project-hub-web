import type { BaseResponse } from "@/domain/dto/base-response";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetSprintByIdUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, sprintId: string): Promise<BaseResponse<SprintResponseDTO>> {
        return await this.projectHubRepo.getSprintById(token, sprintId);
    }
}