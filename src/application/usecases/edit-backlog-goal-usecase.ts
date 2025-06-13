import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";
import type { EditBacklogGoalRequestDTO } from '../../domain/dto/req/edit-backlog-goal-req';

export class EditBacklogGoalUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: EditBacklogGoalRequestDTO): Promise<BaseResponse<ProductBacklog>> {
        return this.projectHubRepo.editBacklogGoal(token, data);
    }
}