import { CreateSprintUseCase } from "@/application/usecases/create-sprint-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { CreateSprintRequestDTO } from "@/domain/dto/req/create-sprint-req";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const createSprintUseCase = new CreateSprintUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: CreateSprintRequestDTO }
): Promise<BaseResponse<SprintResponseDTO>> {

    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found");
    }

    const result = await createSprintUseCase.execute(token, arg);
    return result;

}

export function useCreateSprint() {
    const { trigger, data, isMutating } = useSWRMutation("/sprint", fetcher);

    const triggerCreateSprint = async (payload: CreateSprintRequestDTO): Promise<BaseResponse<SprintResponseDTO>> => {
        try {
            return await trigger(payload);
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<SprintResponseDTO>(err);
        }
    };

    return {
        triggerCreateSprint,
        triggerCreateSprintResponse: data,
        triggerCreateSprintLoading: isMutating,
    };
}
