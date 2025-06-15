import type { ProjectRole } from "@/constants/constants";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectMembersUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, role: ProjectRole): Promise<BaseResponse<ProjectUserResponseDTO[]>> {
        return await this.projectHubRepo.getProjectMembers(token, projectId, role);
    }
}