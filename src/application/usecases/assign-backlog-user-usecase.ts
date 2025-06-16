import type { AssignBacklogUserRequestDTO } from "@/domain/dto/req/assign-backlog-user-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class AssignBacklogUserUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: AssignBacklogUserRequestDTO): Promise<BaseResponse<ProductBacklog>> {
        return this.projectHubRepo.assignBacklogUser(token, data);
    }
}