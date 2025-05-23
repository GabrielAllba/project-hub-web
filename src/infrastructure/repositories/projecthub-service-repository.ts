import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { CreateProjectRequestDTO } from "@/domain/dto/req/create-project-req";
import type { Project } from "@/domain/entities/project";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import { projectHubService } from "../api/project-hub-services";

export class ProjectHubServiceRepository {
  async getMyProject(token: string, page: number, size: number): Promise<BaseResponse<Page<ProjectSummary>>> {
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

  async createProject(token: string, data: CreateProjectRequestDTO): Promise<BaseResponse<Project>> {
    const response = await projectHubService.post(
      "/project",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
}
