import { DeleteBacklogUseCase } from "@/application/usecases/delete-backlog-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const deleteBacklogUseCase = new DeleteBacklogUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { backlogId: string } }
): Promise<BaseResponse<void>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await deleteBacklogUseCase.execute(token, arg.backlogId);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<void>(err);
    }
}

export function useDeleteBacklog(backlogId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/product_backlog/${backlogId}`, fetcher);

    const triggerDeleteBacklog = async (): Promise<BaseResponse<void>> => {
        return await trigger({ backlogId });
    };

    return {
        triggerDeleteBacklog,
        triggerDeleteBacklogResponse: data,
        triggerDeleteBacklogLoading: isMutating,
    };
}
