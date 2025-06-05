import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class DeleteBacklogUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, backlogId: string): Promise<BaseResponse<void>> {
        return this.projectHubRepo.deleteBacklog(token, backlogId);
    }
}