import type { BaseResponse } from "@/domain/dto/base-response";
import type { EditBacklogGoalRequestDTO } from "@/domain/dto/req/edit-backlog-goal-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { EditBacklogGoalUseCase } from '../../application/usecases/edit-backlog-goal-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const editBacklogGoalUseCase = new EditBacklogGoalUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: EditBacklogGoalRequestDTO }
): Promise<BaseResponse<ProductBacklog>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await editBacklogGoalUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}

export function useEditBacklogGoal() {
    const { trigger, data, isMutating } = useSWRMutation("/product_backlog/edit_backlog_goal", fetcher);

    const triggerEditBacklogGoal = async (payload: EditBacklogGoalRequestDTO): Promise<BaseResponse<ProductBacklog>> => {
        return await trigger(payload);
    };

    return {
        triggerEditBacklogGoal,
        triggerEditBacklogGoalResponse: data,
        triggerEditBacklogGoalLoading: isMutating,
    };
}
