import { GetProjectSprintsUseCase } from "@/application/usecases/get-project-sprints-usecase"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProjectSprintsUseCase = new GetProjectSprintsUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, projectId, page, size } }: { arg: { token: string; projectId: string; page: number; size: number } },
): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    try {
        return await getProjectSprintsUseCase.execute(token, projectId, page, size)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<SprintResponseDTO>>(err)
    }
}

export function useGetProjectSprints(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/product_backlog/${projectId}`, fetcher)

    const triggerGetProjectSprints = async (page: number, size: number): Promise<BaseResponse<Page<SprintResponseDTO>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, page, size })
    }

    return {
        triggerGetProjectSprints,
        triggerGetProjectSprintsResponse: data,
        triggerGetProjectSprintsLoading: isMutating,
        triggerGetProjectSprintsError: error,
    }
}
