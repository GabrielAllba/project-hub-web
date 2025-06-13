import type { BaseResponse } from "@/domain/dto/base-response";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { StartSprintUseCase } from '../../application/usecases/start-sprint-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const startSprintUseCase = new StartSprintUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { sprintId } }: { arg: { sprintId: string; } },
): Promise<BaseResponse<SprintResponseDTO>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await startSprintUseCase.execute(token, sprintId);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<SprintResponseDTO>(err);
    }
}

export function useStartSprint(sprintId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/sprint/${sprintId}/start`, fetcher);

    const triggerStartSprint = async (): Promise<BaseResponse<SprintResponseDTO>> => {
        return await trigger({sprintId: sprintId});
    };

    return {
        triggerStartSprint,
        triggerStartSprintResponse: data,
        triggerStartSprintLoading: isMutating,
    };
}
