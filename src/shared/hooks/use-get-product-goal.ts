import type { BaseResponse } from "@/domain/dto/base-response"
import type { Page } from "@/domain/dto/page-response"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository"
import useSWRMutation from "swr/mutation"
import { GetProductGoalUseCase } from '../../application/usecases/get-product-goal-usecase'
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils"

const getProductGoalUseCase = new GetProductGoalUseCase(new ProjectHubServiceRepository())

async function fetcher(
    _: string,
    { arg: { token, projectId, page, size } }: { arg: { token: string; projectId: string; page: number; size: number } },
): Promise<BaseResponse<Page<ProductGoal>>> {
    try {
        return await getProductGoalUseCase.execute(token, projectId, page, size)
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<ProductGoal>>(err)
    }
}

export function useGetProductGoal(projectId: string) {
    const { trigger, data, isMutating, error } = useSWRMutation(`/product-goal/by_project/${projectId}`, fetcher)

    const triggerGetProductGoal = async (projectId: string, page: number, size: number): Promise<BaseResponse<Page<ProductGoal>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")

        return await trigger({ token, projectId, page, size })
    }

    return {
        triggerGetProductGoal,
        triggerGetProductGoalResponse: data,
        triggerGetProductGoalLoading: isMutating,
        triggerGetProductGoalError: error,
    }
}
