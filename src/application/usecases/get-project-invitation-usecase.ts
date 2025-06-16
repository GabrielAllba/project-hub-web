import type { BaseResponse } from "@/domain/dto/base-response";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectInvitationByIdUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, userId: string): Promise<BaseResponse<InvitationResponseDTO>> {
        return await this.projectHubRepo.getProjectInvitationById(token, userId);
    }
}