import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { GetProductGoalByProjectResponseDTO } from "@/domain/dto/res/get-product-goal-by-project-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProductGoalUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, page: number, size: number): Promise<BaseResponse<Page<GetProductGoalByProjectResponseDTO>>> {
        return await this.projectHubRepo.getProductGoal(token, projectId, page, size);
    }
}