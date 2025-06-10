import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { EditBacklogPriorityUseCase } from '../../application/usecases/edit-backlog-priority-usecase';
import { type EditBacklogPriorityRequestDTO } from '../../domain/dto/req/edit-backlog-priority-req';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const editBacklogPriorityUseCase = new EditBacklogPriorityUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: EditBacklogPriorityRequestDTO }
): Promise<BaseResponse<ProductBacklog>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await editBacklogPriorityUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}

export function useEditBacklogPriority() {
    const { trigger, data, isMutating } = useSWRMutation("/product_backlog/edit_backlog_priority", fetcher);

    const triggerEditBacklogPriority = async (payload: EditBacklogPriorityRequestDTO): Promise<BaseResponse<ProductBacklog>> => {
        return await trigger(payload);
    };

    return {
        triggerEditBacklogPriority,
        triggerEditBacklogPriorityResponse: data,
        triggerEditBacklogPriorityLoading: isMutating,
    };
}
