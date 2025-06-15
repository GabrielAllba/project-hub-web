
import type { AddScrumMasterRequestDTO } from "@/domain/dto/req/add-scrum-master-req";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class InviteScrumMasterUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, data: AddScrumMasterRequestDTO): Promise<BaseResponse<InvitationResponseDTO[]>> {
        return this.projectHubRepo.inviteScrumMaster(token, projectId, data);
    }
}