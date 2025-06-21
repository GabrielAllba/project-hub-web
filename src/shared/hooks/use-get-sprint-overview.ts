
import type { BaseResponse } from "@/domain/dto/base-response";
import type { SprintOverviewResponseDTO } from "@/domain/dto/res/sprint-overview-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { GetSprintOverviewseCase } from '../../application/usecases/get-sprint-overview';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getSprintOverviewseCase = new GetSprintOverviewseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, sprintId } }: { arg: { token: string; sprintId: string; } },
): Promise<BaseResponse<SprintOverviewResponseDTO>> {
    try {
        return await getSprintOverviewseCase.execute(token, sprintId);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<SprintOverviewResponseDTO>(err);
    }
}
export function useGetSprintOverview(sprintId: string) {
    const { trigger, data, error, isMutating } = useSWRMutation(`/sprint/${sprintId}/overview`, fetcher)

    const triggerGetSprintOverview = async (idSprint: string): Promise<BaseResponse<SprintOverviewResponseDTO>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, sprintId: idSprint });
    };

    return {
        triggerGetSprintOverview,
        triggerGetSprintOverviewResponse: data,
        triggerGetSprintOverviewLoading: isMutating,
        triggerGetSprintOverviewError: error
    };
}