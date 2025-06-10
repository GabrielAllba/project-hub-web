import type { BaseResponse } from "@/domain/dto/base-response";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { DeleteProductGoalUseCase } from '../../application/usecases/delete-product-goal-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const deleteProductGoalUseCase = new DeleteProductGoalUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { productGoalId: string } }
): Promise<BaseResponse<void>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await deleteProductGoalUseCase.execute(token, arg.productGoalId);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<void>(err);
    }
}

export function useDeleteProductGoal(productGoalId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/product-goal/${productGoalId}`, fetcher);

    const triggerDeleteProductGoal = async (idGoal: string): Promise<BaseResponse<void>> => {
        return await trigger({ productGoalId: idGoal });
    };

    return {
        triggerDeleteProductGoal,
        triggerDeleteProductGoalResponse: data,
        triggerDeleteProductGoalLoading: isMutating,
    };
}
