import { ReorderProductBacklogUseCase } from "@/application/usecases/reorder-product-backlog-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { ReorderBacklogRequestDTO } from "@/domain/dto/req/reorder-backlog-req";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const reorderProductBacklogUseCase = new ReorderProductBacklogUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { dto: ReorderBacklogRequestDTO; projectId: string } }
): Promise<BaseResponse<void>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await reorderProductBacklogUseCase.execute(token, arg.projectId, arg.dto);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<void>(err);
    }
}

export function useReorderProductBacklog(projectId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/product_backlog/${projectId}/reorder`, fetcher);

    const triggerReorderProductBacklog = async (
        dto: ReorderBacklogRequestDTO,
    ): Promise<BaseResponse<void>> => {
        return await trigger({ dto, projectId });
    };

    return {
        triggerReorderProductBacklog,
        triggerReorderProductBacklogResponse: data,
        triggerReorderProductBacklogLoading: isMutating,
    };
}
