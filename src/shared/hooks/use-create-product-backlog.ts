import { CreateProductBacklogUseCase } from "@/application/usecases/create-product-backlog-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { CreateProductBacklogRequestDTO } from "@/domain/dto/req/create-product-backlog-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const createProductBacklogUseCase = new CreateProductBacklogUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { dto: CreateProductBacklogRequestDTO; projectId: string } }
): Promise<BaseResponse<ProductBacklog>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await createProductBacklogUseCase.execute(token, arg.projectId, arg.dto);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}

export function useCreateProductBacklog() {
    const { trigger, data, isMutating } = useSWRMutation("/product_backlog", fetcher);

    const triggerCreateProductBacklog = async (
        dto: CreateProductBacklogRequestDTO,
        projectId: string
    ): Promise<BaseResponse<ProductBacklog>> => {
        return await trigger({ dto, projectId });
    };

    return {
        triggerCreateProductBacklog,
        triggerCreateProductBacklogResponse: data,
        triggerCreateProductBacklogLoading: isMutating,
    };
}
