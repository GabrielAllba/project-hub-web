
import { GetProductBacklogByIdUseCase } from "@/application/usecases/get-product-backlog-by-id-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getProductBacklogByIdUseCase = new GetProductBacklogByIdUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, backlogId } }: { arg: { token: string; backlogId: string; } },
): Promise<BaseResponse<ProductBacklog>> {
    try {
        return await getProductBacklogByIdUseCase.execute(token, backlogId);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}
export function useGetProductBacklogById(backlogId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/product_backlog/${backlogId}`, fetcher)

    const triggerGetProductBacklogById = async (idBacklog: string): Promise<BaseResponse<ProductBacklog>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, backlogId: idBacklog });
    };

    return {
        triggerGetProductBacklogById,
        triggerGetProductBacklogByIdResponse: data,
        triggerGetProductBacklogByIdLoading: isMutating,
    };
}