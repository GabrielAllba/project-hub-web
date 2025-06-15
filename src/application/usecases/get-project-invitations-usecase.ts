import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProjectInvitationsUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, userId: string, page: number, size: number): Promise<BaseResponse<Page<InvitationResponseDTO>>> {
        return await this.projectHubRepo.getProjectInvitations(token, userId, page, size);
    }
}