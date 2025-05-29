import type { CreateSprintRequestDTO } from "@/domain/dto/req/create-sprint-req";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class CreateSprintUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: CreateSprintRequestDTO): Promise<BaseResponse<SprintResponseDTO>> {
        return this.projectHubRepo.createSprint(token, data);
    }
}