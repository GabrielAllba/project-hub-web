import type { BaseResponse } from "@/domain/dto/base-response";

import type { CompleteSprintInfoResponseDTO } from "@/domain/dto/res/complete-sprint-info-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { GetCompleteSprintInfoUseCase } from '../../application/usecases/get-complete-sprint-info-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getCompleteSprintInfoUseCase = new GetCompleteSprintInfoUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { sprintId } }: { arg: { sprintId: string; } },
): Promise<BaseResponse<CompleteSprintInfoResponseDTO>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await getCompleteSprintInfoUseCase.execute(token, sprintId);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<CompleteSprintInfoResponseDTO>(err);
    }
}

export function useGetCompleteSprintInfo(sprintId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/sprint/${sprintId}/complete_sprint/info`, fetcher);

    const triggerGetCompleteSprintInfo = async (): Promise<BaseResponse<CompleteSprintInfoResponseDTO>> => {
        return await trigger({ sprintId: sprintId });
    };

    return {
        triggerGetCompleteSprintInfo,
        triggerGetCompleteSprintInfoResponse: data,
        triggerGetCompleteSprintInfoLoading: isMutating,
    };
}
