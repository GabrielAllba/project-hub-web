import type { MoveBacklogToSprintRequestDTO } from "@/domain/dto/req/move-backlog-to-sprint-req";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class MoveBacklogToSprintUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, data: MoveBacklogToSprintRequestDTO): Promise<BaseResponse<void>> {
        return this.projectHubRepo.moveProductBacklogToSprint(token, projectId, data);
    }
}