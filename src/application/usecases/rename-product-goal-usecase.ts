import type { RenameProductGoalRequestDTO } from "@/domain/dto/req/rename-product-goal-req";
import type { ProductGoal } from "@/domain/entities/product-goal";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class RenameProductGoalUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: RenameProductGoalRequestDTO): Promise<BaseResponse<ProductGoal>> {
        return this.projectHubRepo.renameProductGoal(token, data);
    }
}