import type { BaseResponse } from "@/domain/dto/base-response";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { AcceptProjectInvitationUseCase } from '../../application/usecases/accept-project-invitation-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const acceptProjectInvitationUseCase = new AcceptProjectInvitationUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: string }
): Promise<BaseResponse<InvitationResponseDTO>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await acceptProjectInvitationUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<InvitationResponseDTO>(err);
    }
}

export function useAcceptProjectInvitation(invitationId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/project/${invitationId}/accept`, fetcher);

    const triggerAcceptProjectInvitation = async (inviteId: string): Promise<BaseResponse<InvitationResponseDTO>> => {
        return await trigger(inviteId);
    };

    return {
        triggerAcceptProjectInvitation,
        triggerAcceptProjectInvitationResponse: data,
        triggerAcceptProjectInvitationLoading: isMutating,
    };
}
