import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class DeleteProductGoalUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, productGoalId: string): Promise<BaseResponse<void>> {
        return this.projectHubRepo.deleteProductGoal(token, productGoalId);
    }
}