
import { GetProductGoalByIdUseCase } from "@/application/usecases/get-product-goal-by-id-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";
import type { ProductGoal } from "@/domain/entities/product-goal";

const getProductGoalByIdUseCase = new GetProductGoalByIdUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, productGoalId } }: { arg: { token: string; productGoalId: string; } },
): Promise<BaseResponse<ProductGoal>> {
    try {
        return await getProductGoalByIdUseCase.execute(token, productGoalId);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductGoal>(err);
    }
}
export function useGetProductGoalById(productGoalId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/product-goal/${productGoalId}`, fetcher)

    const triggerGetProductGoalById = async (idProductGoal: string): Promise<BaseResponse<ProductGoal>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, productGoalId: idProductGoal });
    };

    return {
        triggerGetProductGoalById,
        triggerGetProductGoalByIdResponse: data,
        triggerGetProductGoalByIdLoading: isMutating,
    };
}