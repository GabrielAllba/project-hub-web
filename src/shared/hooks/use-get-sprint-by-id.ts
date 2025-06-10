
import { GetSprintByIdUseCase } from "@/application/usecases/get-sprint-by-id-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getSprintByIdUseCase = new GetSprintByIdUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, sprintId } }: { arg: { token: string; sprintId: string; } },
): Promise<BaseResponse<SprintResponseDTO>> {
    try {
        return await getSprintByIdUseCase.execute(token, sprintId);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<SprintResponseDTO>(err);
    }
}
export function useGetSprintById(sprintId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/sprint/${sprintId}`, fetcher)

    const triggerGetSprintById = async (idSprint: string): Promise<BaseResponse<SprintResponseDTO>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, sprintId: idSprint });
    };

    return {
        triggerGetSprintById,
        triggerGetSprintByIdResponse: data,
        triggerGetSprintByIdLoading: isMutating,
    };
}