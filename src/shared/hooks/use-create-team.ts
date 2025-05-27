import type { BaseResponse } from "@/domain/dto/base-response";
import type { CreateTeamRequestDTO } from "@/domain/dto/req/create-team-req";
import type { Team } from "@/domain/entities/team";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { CreateTeamUseCase } from '../../application/usecases/create-team-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const createTeamUseCase = new CreateTeamUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: CreateTeamRequestDTO }
): Promise<BaseResponse<Team>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await createTeamUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Team>(err);
    }
}

export function useCreateTeam() {
    const { trigger, data, isMutating } = useSWRMutation("/team/create", fetcher);

    const triggerCreateTeam = async (payload: CreateTeamRequestDTO): Promise<BaseResponse<Team>> => {
        return await trigger(payload);
    };

    return {
        triggerCreateTeam,
        triggerCreateTeamResponse: data,
        triggerCreateTeamLoading: isMutating,
    };
}
