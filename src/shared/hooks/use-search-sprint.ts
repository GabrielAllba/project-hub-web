import type { BaseResponse } from "@/domain/dto/base-response"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"

import { SearchSprintsUseCase } from "@/application/usecases/use-search-sprint-usecase"
import type { Page } from "@/domain/dto/page-response"
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res"
import useSWRMutation from "swr/mutation"
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const searchSprintsUseCase = new SearchSprintsUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    {
        arg: { token, projectId, keyword, page, size },
    }: {
        arg: { token: string; projectId: string; keyword: string; page: number; size: number }
    }
): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    try {
        return await searchSprintsUseCase.execute(token, projectId, keyword, page, size)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<SprintResponseDTO>>(err)
    }
}

export function useSearchSprints(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/sprint/${projectId}/search`, fetcher)

    const triggerSearchSprints = async (
        keyword: string,
        page: number = 0,
        size: number = 10
    ): Promise<BaseResponse<Page<SprintResponseDTO>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, keyword, page, size })
    }

    return {
        triggerSearchSprints,
        searchSprintsResponse: data,
        searchSprintsLoading: isMutating,
        searchSprintsError: error,
    }
}
