import type { BaseResponse } from "@/domain/dto/base-response"
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { GetProjectInvitationByIdUseCase } from '../../application/usecases/get-project-invitation-usecase'
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProjectInvitationByIdUseCase = new GetProjectInvitationByIdUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, invitationId } }: { arg: { token: string; invitationId: string; } },
): Promise<BaseResponse<InvitationResponseDTO>> {
    try {
        return await getProjectInvitationByIdUseCase.execute(token, invitationId)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<InvitationResponseDTO>(err)
    }
}

export function useGetProjectInvitationById(invitationId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/project_invitation/${invitationId}`, fetcher)

    const triggerGetProjectInvitationById = async (): Promise<BaseResponse<InvitationResponseDTO>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, invitationId })
    }

    return {
        triggerGetProjectInvitationById,
        triggerGetProjectInvitationByIdResponse: data,
        triggerGetProjectInvitationByIdLoading: isMutating,
        triggerGetProjectInvitationByIdError: error,
    }
}
