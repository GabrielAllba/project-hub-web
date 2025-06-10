import type { BaseResponse } from "@/domain/dto/base-response";
import type { EditBacklogTitleRequestDTO } from "@/domain/dto/req/edit-backlog-title-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { EditBacklogTitleUseCase } from '../../application/usecases/edit-backlog-title-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const editBacklogTitleUseCase = new EditBacklogTitleUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: EditBacklogTitleRequestDTO }
): Promise<BaseResponse<ProductBacklog>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await editBacklogTitleUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}

export function useEditBacklogTitle() {
    const { trigger, data, isMutating } = useSWRMutation("/product_backlog/edit_backlog_title", fetcher);

    const triggerEditBacklogTitle = async (payload: EditBacklogTitleRequestDTO): Promise<BaseResponse<ProductBacklog>> => {
        return await trigger(payload);
    };

    return {
        triggerEditBacklogTitle,
        triggerEditBacklogTitleResponse: data,
        triggerEditBacklogTitleLoading: isMutating,
    };
}
