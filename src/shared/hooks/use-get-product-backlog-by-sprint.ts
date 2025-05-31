import { GetProductBacklogBySprintUseCase } from "@/application/usecases/get-product-backlog-by-sprint-usecase"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProductBacklogBySprintUseCase = new GetProductBacklogBySprintUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, sprintId, page, size } }: { arg: { token: string; sprintId: string; page: number; size: number } },
): Promise<BaseResponse<Page<ProductBacklog>>> {
    try {
        return await getProductBacklogBySprintUseCase.execute(token, sprintId, page, size)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<ProductBacklog>>(err)
    }
}

export function useGetProductBacklogBySprint(sprintId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/sprint/${sprintId}/product_backlogs`, fetcher)

    const triggerGetProductBacklogBySprint = async (sprintId: string, page: number, size: number): Promise<BaseResponse<Page<ProductBacklog>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, sprintId, page, size })
    }

    return {
        triggerGetProductBacklogBySprint,
        triggerGetProductBacklogBySprintResponse: data,
        triggerGetProductBacklogBySprintLoading: isMutating,
        triggerGetProductBacklogBySprintError: error,
    }
}
