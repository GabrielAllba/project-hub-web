import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import type { AddDeveloperRequestDTO } from "@/domain/dto/req/add-developer-req";

export class InviteDeveloperUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, projectId: string, data: AddDeveloperRequestDTO): Promise<BaseResponse<InvitationResponseDTO[]>> {
        return this.projectHubRepo.inviteDeveloper(token, projectId, data );
    }
}