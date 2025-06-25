import { GetBacklogLogsUseCase } from "@/application/usecases/get-backlog-logs-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { BacklogActivityLogResponseDTO } from "@/domain/dto/res/backlog-activity-log-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getBacklogLogsUseCase = new GetBacklogLogsUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    {
        arg: { token, backlogId, page, size },
    }: {
        arg: { token: string; backlogId: string; page: number; size: number };
    }
): Promise<BaseResponse<Page<BacklogActivityLogResponseDTO>>> {

    return await getBacklogLogsUseCase.execute(token, backlogId, page, size);

}

export function useGetBacklogLogs(
    backlogId: string,
) {
    const { trigger, data, isMutating } = useSWRMutation(`/logs/backlog/${backlogId}`, fetcher);

    const triggerGetBacklogLogs = async (idBacklog: string, page: number, size: number): Promise<BaseResponse<Page<BacklogActivityLogResponseDTO>>> => {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No access token found")
        try {
            return await trigger({ token, backlogId: idBacklog, page, size });
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<Page<BacklogActivityLogResponseDTO>>(err);
        }
    };

    return {
        triggerGetBacklogLogs,
        triggerGetBacklogLogsResponse: data,
        triggerGetBacklogLogsLoading: isMutating,
    };
}
