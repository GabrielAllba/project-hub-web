import type { BaseResponse } from "@/domain/dto/base-response";
import type { RenameProductGoalRequestDTO } from "@/domain/dto/req/rename-product-goal-req";
import type { ProductGoal } from "@/domain/entities/product-goal";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { RenameProductGoalUseCase } from '../../application/usecases/rename-product-goal-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const renameProductGoalUseCase = new RenameProductGoalUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: RenameProductGoalRequestDTO }
): Promise<BaseResponse<ProductGoal>> {

    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found");
    }

    const result = await renameProductGoalUseCase.execute(token, arg);
    return result;

}

export function useRenameProductGoal() {
    const { trigger, data, isMutating } = useSWRMutation("/product-goal/rename", fetcher);

    const triggerRenameProductGoal = async (payload: RenameProductGoalRequestDTO): Promise<BaseResponse<ProductGoal>> => {
        try {
            return await trigger(payload);
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<ProductGoal>(err);
        }
    };

    return {
        triggerRenameProductGoal,
        triggerRenameProductGoalResponse: data,
        triggerRenameProductGoalLoading: isMutating,
    };
}
