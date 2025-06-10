import type { CreateProductGoalRequestDTO } from "@/domain/dto/req/create-product-goal-req";
import type { ProductGoal } from "@/domain/entities/product-goal";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class CreateProductGoalUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: CreateProductGoalRequestDTO): Promise<BaseResponse<ProductGoal>> {
        return this.projectHubRepo.createProductGoal(token, data);
    }
}