import type { ProjectRole } from "@/constants/constants"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { GetProjectMembersUseCase } from '../../application/usecases/get-project-members-usecase'
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProjectMembersUseCase = new GetProjectMembersUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, projectId, role } }: { arg: { token: string; projectId: string; role: ProjectRole } },
): Promise<BaseResponse<ProjectUserResponseDTO[]>> {
    try {
        return await getProjectMembersUseCase.execute(token, projectId, role)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProjectUserResponseDTO[]>(err)
    }
}

export function useGetProjectMembers(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/project/${projectId}/members`, fetcher)

    const triggerGetProjectMembers = async (role: ProjectRole): Promise<BaseResponse<ProjectUserResponseDTO[]>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, role })
    }

    return {
        triggerGetProjectMembers,
        triggerGetProjectMembersResponse: data,
        triggerGetProjectMembersLoading: isMutating,
        triggerGetProjectMembersError: error,
    }
}
