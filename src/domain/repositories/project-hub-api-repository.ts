import { projectHubService } from "@/infrastructure/http/project-hub-service";
import type { BaseResponse } from "../dto/base-response";
import type { Page } from "../dto/page-response";
import type { ProjectSummary } from "../entities/project-summary";

export class ProjectHubApiRepository {
  async getMyProject(
    token: string,
    page: number = 0,
    size: number = 10
  ): Promise<BaseResponse<Page<ProjectSummary>>> {
    const response = await projectHubService.get("/project/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        size,
      },
    });

    return response.data;
  }
}
