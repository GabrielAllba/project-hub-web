import type { AddProductOwnerRequestDTO } from "@/domain/dto/req/add-product-owner-req";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class InviteProductOwnerUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, data: AddProductOwnerRequestDTO): Promise<BaseResponse<InvitationResponseDTO[]>> {
        return this.projectHubRepo.inviteProductOwner(token, projectId, data);
    }
}