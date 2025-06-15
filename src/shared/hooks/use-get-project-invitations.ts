import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { GetProjectInvitationsUseCase } from '../../application/usecases/get-project-invitations-usecase'
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProjectInvitationsUseCase = new GetProjectInvitationsUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, userId, page, size } }: { arg: { token: string; userId: string; page: number; size: number } },
): Promise<BaseResponse<Page<InvitationResponseDTO>>> {
    try {
        return await getProjectInvitationsUseCase.execute(token, userId, page, size)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<InvitationResponseDTO>>(err)
    }
}

export function useGetProjectInvitations(userId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/project_invitation/${userId}`, fetcher)

    const triggerGetProjectInvitations = async (page: number, size: number): Promise<BaseResponse<Page<InvitationResponseDTO>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, userId, page, size })
    }

    return {
        triggerGetProjectInvitations,
        triggerGetProjectInvitationsResponse: data,
        triggerGetProjectInvitationsLoading: isMutating,
        triggerGetProjectInvitationsError: error,
    }
}
