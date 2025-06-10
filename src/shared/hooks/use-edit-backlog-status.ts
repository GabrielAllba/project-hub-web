import type { BaseResponse } from "@/domain/dto/base-response";
import type { EditBacklogStatusRequestDTO } from "@/domain/dto/req/edit-backlog-status-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { EditBacklogStatusUseCase } from '../../application/usecases/edit-backlog-status-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const editBacklogStatusUseCase = new EditBacklogStatusUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: EditBacklogStatusRequestDTO }
): Promise<BaseResponse<ProductBacklog>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await editBacklogStatusUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}

export function useEditBacklogStatus() {
    const { trigger, data, isMutating } = useSWRMutation("/product_backlog/edit_backlog_status", fetcher);

    const triggerEditBacklogStatus = async (payload: EditBacklogStatusRequestDTO): Promise<BaseResponse<ProductBacklog>> => {
        return await trigger(payload);
    };

    return {
        triggerEditBacklogStatus,
        triggerEditBacklogStatusResponse: data,
        triggerEditBacklogStatusLoading: isMutating,
    };
}
