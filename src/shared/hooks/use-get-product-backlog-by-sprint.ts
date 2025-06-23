import { GetProductBacklogBySprintUseCase } from "@/application/usecases/get-product-backlog-by-sprint-usecase"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type {
    ProductBacklog,
    ProductBacklogPriority,
    ProductBacklogStatus,
} from "@/domain/entities/product-backlog"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

interface FetchArgs {
    token: string
    sprintId: string
    page: number
    size: number
    options?: {
        search?: string
        status?: ProductBacklogStatus
        priority?: ProductBacklogPriority
        productGoalIds?: string[]
        assigneeIds?: string[]
    }
}

const getProductBacklogBySprintUseCase = new GetProductBacklogBySprintUseCase(
    new ProjectHubServiceRepository()
)

async function fetcher(
    _: string,
    { arg }: { arg: FetchArgs }
): Promise<BaseResponse<Page<ProductBacklog>>> {
    try {
        return await getProductBacklogBySprintUseCase.execute(
            arg.token,
            arg.sprintId,
            arg.page,
            arg.size,
            arg.options
        )
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<ProductBacklog>>(err)
    }
}

export function useGetProductBacklogBySprint(sprintId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(
        `/sprint/${sprintId}/product_backlogs`,
        fetcher
    )

    const triggerGetProductBacklogBySprint = async (
        sprintId: string,
        page: number,
        size: number,
        options?: {
            search?: string
            status?: ProductBacklogStatus
            priority?: ProductBacklogPriority
            productGoalIds?: string[]
            assigneeIds?: string[]
        }
    ): Promise<BaseResponse<Page<ProductBacklog>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, sprintId, page, size, options })
    }

    return {
        triggerGetProductBacklogBySprint,
        triggerGetProductBacklogBySprintResponse: data,
        triggerGetProductBacklogBySprintLoading: isMutating,
        triggerGetProductBacklogBySprintError: error,
    }
}
