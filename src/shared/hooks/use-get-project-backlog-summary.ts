import type { BaseResponse } from "@/domain/dto/base-response"
import type { ProjectBacklogSummaryResponseDTO } from "@/domain/dto/res/project-backlog-summary-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { GetProjectBacklogSummaryUseCase } from '../../application/usecases/get-project-backlog-summary-usecase'
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProjectBacklogSummaryUseCase = new GetProjectBacklogSummaryUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, projectId } }: { arg: { token: string; projectId: string } },
): Promise<BaseResponse<ProjectBacklogSummaryResponseDTO>> {
    try {
        return await getProjectBacklogSummaryUseCase.execute(token, projectId)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProjectBacklogSummaryResponseDTO>(err)
    }
}

export function useGetProjectBacklogSummary(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/project/${projectId}/backlog_summary`, fetcher)

    const triggerGetProjectBacklogSummary = async (): Promise<BaseResponse<ProjectBacklogSummaryResponseDTO>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId })
    }

    return {
        triggerGetProjectBacklogSummary,
        triggerGetProjectBacklogSummaryResponse: data,
        triggerGetProjectBacklogSummaryLoading: isMutating,
        triggerGetProjectBacklogSummaryError: error,
    }
}
