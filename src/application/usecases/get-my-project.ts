import type { Page } from "@/domain/dto/page-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { ProjectHubApiRepository } from "@/domain/repositories/project-hub-api-repository";
import type { BaseResponse } from "@/domain/dto/base-response";

export class GetMyProjectUseCase {
  constructor(private readonly projectHubRepo: ProjectHubApiRepository) {}

  async execute(token: string, page = 0, size = 10): Promise<BaseResponse<Page<ProjectSummary>>> {
    return await this.projectHubRepo.getMyProject(token, page, size);
  }

  async getProjectForSidebar(token: string): Promise<BaseResponse<Page<ProjectSummary>>> {
    const page = 0;
    const size = 5;
    return await this.projectHubRepo.getMyProject(token, page, size);
  }
}
