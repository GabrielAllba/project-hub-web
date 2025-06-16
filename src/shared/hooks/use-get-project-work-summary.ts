import type { BaseResponse } from "@/domain/dto/base-response"
import type { UserWorkItemSummaryResponseDTO } from "@/domain/dto/res/user-work-item-summary-res"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { GetProjectWorkSummaryUseCase } from '../../application/usecases/get-project-work-summary-usecase'
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProjectWorkSummaryUseCase = new GetProjectWorkSummaryUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, projectId, range } }: { arg: { token: string; projectId: string; range: string } },
): Promise<BaseResponse<UserWorkItemSummaryResponseDTO[]>> {
    try {
        return await getProjectWorkSummaryUseCase.execute(token, projectId, range)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<UserWorkItemSummaryResponseDTO[]>(err)
    }
}

export function useGetProjectWorkSummary(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/project/${projectId}/work_summary`, fetcher)

    const triggerGetProjectWorkSummary = async (range: string): Promise<BaseResponse<UserWorkItemSummaryResponseDTO[]>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, range })
    }

    return {
        triggerGetProjectWorkSummary,
        triggerGetProjectWorkSummaryResponse: data,
        triggerGetProjectWorkSummaryLoading: isMutating,
        triggerGetProjectWorkSummaryError: error,
    }
}
