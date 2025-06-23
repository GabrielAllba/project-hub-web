import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { GetMyActiveBacklogResponseDTO } from "@/domain/dto/res/get-my-active-backlog-res";

import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetMyActiveBacklogsUseCase {
    constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

    async execute(
        token: string,
        page: number,
        size: number
    ): Promise<BaseResponse<Page<GetMyActiveBacklogResponseDTO>>> {
        return await this.projectHubRepo.getMyActiveBacklogs(token, page, size);
    }
}
