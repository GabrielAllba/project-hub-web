import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetMySidebarProjectUseCase {
  constructor(private readonly projectHubRepo: ProjectHubServiceRepository) {}

  async execute(token: string): Promise<BaseResponse<Page<ProjectSummary>>> {
    return await this.projectHubRepo.getMyProject(token, 0, 5);
  }
}