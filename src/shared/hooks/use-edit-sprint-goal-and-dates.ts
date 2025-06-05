import type { BaseResponse } from "@/domain/dto/base-response";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { EditSprintGoalAndDatesUseCase } from '../../application/usecases/edit-sprint-goal-and-dates-usecase';
import { type EditSprintGoalAndDatesRequestDTO } from '../../domain/dto/req/edit-sprint-goal-and-dates-req';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const editSprintGoalAndDatesUseCase = new EditSprintGoalAndDatesUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: EditSprintGoalAndDatesRequestDTO }
): Promise<BaseResponse<SprintResponseDTO>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await editSprintGoalAndDatesUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<SprintResponseDTO>(err);
    }
}

export function useEditSprintGoalAndDates() {
    const { trigger, data, isMutating } = useSWRMutation("/sprint/edit_goal_and_dates", fetcher);

    const triggerEditSprintGoalAndDates = async (payload: EditSprintGoalAndDatesRequestDTO): Promise<BaseResponse<SprintResponseDTO>> => {
        return await trigger(payload);
    };

    return {
        triggerEditSprintGoalAndDates,
        triggerEditSprintGoalAndDatesResponse: data,
        triggerEditSprintGoalAndDatesLoading: isMutating,
    };
}
