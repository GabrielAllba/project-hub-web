import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { GetProductBacklogUseCase } from "../../application/usecases/get-product-backlog-usecase"
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProductBacklogUseCase = new GetProductBacklogUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, projectId, page, size } }: { arg: { token: string; projectId: string; page: number; size: number } },
): Promise<BaseResponse<Page<ProductBacklog>>> {
    try {
        return await getProductBacklogUseCase.execute(token, projectId, page, size)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<ProductBacklog>>(err)
    }
}

export function useGetProductBacklog(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/product_backlog/${projectId}`, fetcher)

    const triggerGetProductBacklog = async (page: number, size: number): Promise<BaseResponse<Page<ProductBacklog>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, page, size })
    }

    return {
        triggerGetProductBacklog,
        triggerGetProductBacklogResponse: data,
        triggerGetProductBacklogLoading: isMutating,
        triggerGetProductBacklogError: error,
    }
}
