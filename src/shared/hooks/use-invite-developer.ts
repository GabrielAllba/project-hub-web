import type { BaseResponse } from "@/domain/dto/base-response";

import { InviteDeveloperUseCase } from "@/application/usecases/invite-developer-usecase";
import type { AddDeveloperRequestDTO } from "@/domain/dto/req/add-developer-req";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const inviteDeveloperUseCase = new InviteDeveloperUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { dto: AddDeveloperRequestDTO; projectId: string } }
): Promise<BaseResponse<InvitationResponseDTO[]>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await inviteDeveloperUseCase.execute(token, arg.projectId, arg.dto);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<InvitationResponseDTO[]>(err);
    }
}

export function useInviteDeveloper(projectId: string) {
    const { trigger, data, error, isMutating } = useSWRMutation(`/project/${projectId}/developer/invite`, fetcher);

    const triggerInviteDeveloper = async (
        dto: AddDeveloperRequestDTO,
    ): Promise<BaseResponse<InvitationResponseDTO[]>> => {
        return await trigger({ dto, projectId });
    };

    return {
        triggerInviteDeveloper,
        triggerInviteDeveloperError: error,
        triggerInviteDeveloperResponse: data,
        triggerInviteDeveloperLoading: isMutating,
    };
}
