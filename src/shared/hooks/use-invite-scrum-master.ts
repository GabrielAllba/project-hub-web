import type { BaseResponse } from "@/domain/dto/base-response";

import { InviteScrumMasterUseCase } from "@/application/usecases/invite-scrum-master-usecase";
import type { AddScrumMasterRequestDTO } from "@/domain/dto/req/add-scrum-master-req";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const inviteScrumMasterUseCase = new InviteScrumMasterUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { dto: AddScrumMasterRequestDTO; projectId: string } }
): Promise<BaseResponse<InvitationResponseDTO[]>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await inviteScrumMasterUseCase.execute(token, arg.projectId, arg.dto);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<InvitationResponseDTO[]>(err);
    }
}

export function useInviteScrumMaster(projectId: string) {
    const { trigger, data, error, isMutating } = useSWRMutation(`/project/${projectId}/scrum_master/invite`, fetcher);

    const triggerInviteScrumMaster = async (
        dto: AddScrumMasterRequestDTO,
    ): Promise<BaseResponse<InvitationResponseDTO[]>> => {
        return await trigger({ dto, projectId });
    };

    return {
        triggerInviteScrumMaster,
        triggerInviteScrumMasterError: error,
        triggerInviteScrumMasterResponse: data,
        triggerInviteScrumMasterLoading: isMutating,
    };
}
