import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { TimelineSprintResponseDTO } from "@/domain/dto/res/timeline-sprint-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetTimelineProjectSprintsUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(
        token: string,
        projectId: string,
        page: number,
        size: number,
        year: number
    ): Promise<BaseResponse<Page<TimelineSprintResponseDTO>>> {
        return await this.projectHubRepo.getTimelineProjectSprints(token, projectId, page, size, year);
    }
}
