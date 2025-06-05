
import { ReorderProductBacklogUseCase } from "@/application/usecases/reorder-product-backlog-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { ReorderProductBacklogRequestDTO } from "@/domain/dto/req/reorder-product-backlog-req";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const reorderProductBacklogUseCase = new ReorderProductBacklogUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { dto: ReorderProductBacklogRequestDTO } }
): Promise<BaseResponse<void>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await reorderProductBacklogUseCase.execute(token, arg.dto);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<void>(err);
    }
}

export function useReorderProductBacklog() {
    const { trigger, data, error, isMutating } = useSWRMutation(`/backlog/reorder`, fetcher);

    const triggerReorderProductBacklog = async (
        dto: ReorderProductBacklogRequestDTO,
    ): Promise<BaseResponse<void>> => {
        return await trigger({ dto });
    };

    return {
        triggerReorderProductBacklog,
        triggerReorderProductBacklogError: error,
        triggerReorderProductBacklogResponse: data,
        triggerReorderProductBacklogLoading: isMutating,
    };
}
