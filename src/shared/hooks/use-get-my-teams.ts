import { GetMyTeamsUseCase } from "@/application/usecases/get-my-teams-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { TeamSummary } from "@/domain/entities/team-summary";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getMyTeamsUseCase = new GetMyTeamsUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, page, size } }: { arg: { token: string; page: number; size: number } }
): Promise<BaseResponse<Page<TeamSummary>>> {
    try {
        return await getMyTeamsUseCase.execute(token, page, size);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<TeamSummary>>(err);
    }
}


export function useGetMyTeams() {
    const { trigger, data, isMutating } = useSWRMutation("/team/my", fetcher);

    const triggerGetMyTeams = async (page: number, size: number): Promise<BaseResponse<Page<TeamSummary>>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, page, size });
    };

    return {
        triggerGetMyTeams,
        triggerGetMyTeamsResponse: data,
        triggerGetMyTeamsLoading: isMutating,
    };
}