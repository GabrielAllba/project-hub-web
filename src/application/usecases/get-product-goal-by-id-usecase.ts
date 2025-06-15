import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProductGoal } from "@/domain/entities/product-goal";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProductGoalByIdUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, productGoalId: string): Promise<BaseResponse<ProductGoal>> {
        return await this.projectHubRepo.getProductGoalById(token, productGoalId);
    }
}