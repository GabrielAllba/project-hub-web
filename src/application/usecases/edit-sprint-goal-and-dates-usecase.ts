import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";
import { type EditSprintGoalAndDatesRequestDTO } from '../../domain/dto/req/edit-sprint-goal-and-dates-req';

export class EditSprintGoalAndDatesUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(token: string, data: EditSprintGoalAndDatesRequestDTO): Promise<BaseResponse<SprintResponseDTO>> {
        return this.projectHubRepo.editSprintGoalAndDates(token, data);
    }
}