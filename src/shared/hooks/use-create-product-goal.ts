import type { BaseResponse } from "@/domain/dto/base-response";
import type { CreateProductGoalRequestDTO } from "@/domain/dto/req/create-product-goal-req";
import type { ProductGoal } from "@/domain/entities/product-goal";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { CreateProductGoalUseCase } from '../../application/usecases/create-product-goal-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const createProductGoalUseCase = new CreateProductGoalUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: CreateProductGoalRequestDTO }
): Promise<BaseResponse<ProductGoal>> {

    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found");
    }

    const result = await createProductGoalUseCase.execute(token, arg);
    return result;

}

export function useCreateProductGoal() {
    const { trigger, data, isMutating } = useSWRMutation("/product-goal", fetcher);

    const triggerCreateProductGoal = async (payload: CreateProductGoalRequestDTO): Promise<BaseResponse<ProductGoal>> => {
        try {
            return await trigger(payload);
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<ProductGoal>(err);
        }
    };

    return {
        triggerCreateProductGoal,
        triggerCreateProductGoalResponse: data,
        triggerCreateProductGoalLoading: isMutating,
    };
}
