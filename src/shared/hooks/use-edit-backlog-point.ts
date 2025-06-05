import type { BaseResponse } from "@/domain/dto/base-response";
import type { EditBacklogPointRequestDTO } from "@/domain/dto/req/edit-backlog-point-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { EditBacklogPointUseCase } from '../../application/usecases/edit-backlog-point-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const editBacklogPointUseCase = new EditBacklogPointUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: EditBacklogPointRequestDTO }
): Promise<BaseResponse<ProductBacklog>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await editBacklogPointUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}

export function useEditBacklogPoint() {
    const { trigger, data, isMutating } = useSWRMutation("/product_backlog/edit_backlog_point", fetcher);

    const triggerEditBacklogPoint = async (payload: EditBacklogPointRequestDTO): Promise<BaseResponse<ProductBacklog>> => {
        return await trigger(payload);
    };

    return {
        triggerEditBacklogPoint,
        triggerEditBacklogPointResponse: data,
        triggerEditBacklogPointLoading: isMutating,
    };
}
