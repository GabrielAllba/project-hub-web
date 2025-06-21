import { GetTimelineProjectSprintsUseCase } from "@/application/usecases/get-timeline-project-sprints-usecase"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getTimelineProjectSprintsUseCase = new GetTimelineProjectSprintsUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    {
        arg: { token, projectId, page, size, year },
    }: {
        arg: { token: string; projectId: string; page: number; size: number; year: number };
    }
): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    try {
        return await getTimelineProjectSprintsUseCase.execute(token, projectId, page, size, year)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<SprintResponseDTO>>(err)
    }
}

export function useGetTimelineProjectSprints(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/project/${projectId}/sprints/timeline`, fetcher)

    const triggerGetTimelineProjectSprints = async (page: number, size: number, year: number): Promise<BaseResponse<Page<SprintResponseDTO>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, page, size, year })
    }

    return {
        triggerGetTimelineProjectSprints,
        triggerGetTimelineProjectSprintsResponse: data,
        triggerGetTimelineProjectSprintsLoading: isMutating,
        triggerGetTimelineProjectSprintsError: error,
    }
}
