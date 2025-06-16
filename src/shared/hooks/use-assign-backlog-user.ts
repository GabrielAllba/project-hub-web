import type { BaseResponse } from "@/domain/dto/base-response";
import type { AssignBacklogUserRequestDTO } from "@/domain/dto/req/assign-backlog-user-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { AssignBacklogUserUseCase } from '../../application/usecases/assign-backlog-user-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const assignBacklogUserUseCase = new AssignBacklogUserUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: AssignBacklogUserRequestDTO }
): Promise<BaseResponse<ProductBacklog>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await assignBacklogUserUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProductBacklog>(err);
    }
}

export function useAssignBacklogUser() {
    const { trigger, data, isMutating } = useSWRMutation("/product_backlog/assign_user", fetcher);

    const triggerAssignBacklogUser = async (payload: AssignBacklogUserRequestDTO): Promise<BaseResponse<ProductBacklog>> => {
        return await trigger(payload);
    };

    return {
        triggerAssignBacklogUser,
        triggerAssignBacklogUserResponse: data,
        triggerAssignBacklogUserLoading: isMutating,
    };
}
