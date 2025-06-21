
import type { BaseResponse } from "@/domain/dto/base-response";
import type { UserTaskDistributionResponseDTO } from "@/domain/dto/res/user-task-distribution-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { GetSprintTaskDistributionseCase } from '../../application/usecases/get-sprint-task-distribution-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getSprintTaskDistributionseCase = new GetSprintTaskDistributionseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, sprintId } }: { arg: { token: string; sprintId: string; } },
): Promise<BaseResponse<UserTaskDistributionResponseDTO[]>> {
    try {
        return await getSprintTaskDistributionseCase.execute(token, sprintId);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<UserTaskDistributionResponseDTO[]>(err);
    }
}
export function useGetSprintTaskDistribution(sprintId: string) {
    const { trigger, data, error, isMutating } = useSWRMutation(`/sprint/${sprintId}/task_distribution`, fetcher)

    const triggerGetSprintTaskDistribution = async (idSprint: string): Promise<BaseResponse<UserTaskDistributionResponseDTO[]>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, sprintId: idSprint });
    };

    return {
        triggerGetSprintTaskDistribution,
        triggerGetSprintTaskDistributionResponse: data,
        triggerGetSprintTaskDistributionLoading: isMutating,
        triggerGetSprintTaskDistributionError: error
    };
}