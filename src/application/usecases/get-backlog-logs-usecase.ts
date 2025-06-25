import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { BacklogActivityLogResponseDTO } from "@/domain/dto/res/backlog-activity-log-res";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";


export class GetBacklogLogsUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(
        token: string,
        backlogId: string,
        page: number,
        size: number
    ): Promise<BaseResponse<Page<BacklogActivityLogResponseDTO>>> {
        return await this.projectHubRepo.getBacklogLogs(token, backlogId, page, size);
    }
}
