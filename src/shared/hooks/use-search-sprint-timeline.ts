import type { BaseResponse } from "@/domain/dto/base-response"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"

import type { Page } from "@/domain/dto/page-response"
import type { TimelineSprintResponseDTO } from "@/domain/dto/res/timeline-sprint-res"
import useSWRMutation from "swr/mutation"
import { SearchSprintsTimelineUseCase } from '../../application/usecases/search-sprint-timeline-usecase'
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const searchSprintsTimelineUseCase = new SearchSprintsTimelineUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    {
        arg: { token, projectId, keyword, page, size },
    }: {
        arg: { token: string; projectId: string; keyword: string; page: number; size: number }
    }
): Promise<BaseResponse<Page<TimelineSprintResponseDTO>>> {

    return await searchSprintsTimelineUseCase.execute(token, projectId, keyword, page, size)

}

export function useSearchSprintsTimeline(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/sprint/${projectId}/search`, fetcher)

    const triggerSearchSprintsTimeline = async (
        keyword: string,
        page: number = 0,
        size: number = 10
    ): Promise<BaseResponse<Page<TimelineSprintResponseDTO>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        try {
            return await trigger({ token, projectId, keyword, page, size })
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<Page<TimelineSprintResponseDTO>>(err)
        }
    }

    return {
        triggerSearchSprintsTimeline,
        searchSprintsTimelineResponse: data,
        searchSprintsTimelineLoading: isMutating,
        searchSprintsTimelineError: error,
    }
}
