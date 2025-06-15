import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class RejectProjectInvitationUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, invitationId: string): Promise<BaseResponse<InvitationResponseDTO>> {
        return this.projectHubRepo.rejectProjectInvitation(token, invitationId);
    }
}