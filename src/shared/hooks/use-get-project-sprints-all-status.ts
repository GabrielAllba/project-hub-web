
import { GetProjectSprintsAllStatusUseCase } from "@/application/usecases/get-project-sprints-all-status"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProjectSprintsAllStatusUseCase = new GetProjectSprintsAllStatusUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, projectId, page, size } }: { arg: { token: string; projectId: string; page: number; size: number } },
): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    try {
        return await getProjectSprintsAllStatusUseCase.execute(token, projectId, page, size)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<SprintResponseDTO>>(err)
    }
}

export function useGetProjectSprintsAllStatus(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/project/${projectId}`, fetcher)

    const triggerGetProjectSprintsAllStatus = async (page: number, size: number): Promise<BaseResponse<Page<SprintResponseDTO>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, page, size })
    }

    return {
        triggerGetProjectSprintsAllStatus,
        triggerGetProjectSprintsAllStatusResponse: data,
        triggerGetProjectSprintsAllStatusLoading: isMutating,
        triggerGetProjectSprintsAllStatusError: error,
    }
}
