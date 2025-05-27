import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { CreateProductBacklogRequestDTO } from "@/domain/dto/req/create-product-backlog-req";
import type { CreateProjectRequestDTO } from "@/domain/dto/req/create-project-req";
import type { CreateTeamRequestDTO } from "@/domain/dto/req/create-team-req";
import type { UpdateProductBacklogPositionRequestDTO } from "@/domain/dto/req/update-product-backlog-position-req";
import type { ProductBacklog } from "@/domain/entities/product-backlog";
import type { Project } from "@/domain/entities/project";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { Team } from "@/domain/entities/team";
import type { TeamSummary } from "@/domain/entities/team-summary";
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

  async getMyTeams(token: string, page: number, size: number): Promise<BaseResponse<Page<TeamSummary>>> {
    const response = await projectHubService.get("/team/my", {
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

  async createTeam(token: string, data: CreateTeamRequestDTO): Promise<BaseResponse<Team>> {
    const response = await projectHubService.post(
      "/team",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

  async getProductBacklog(token: string, projectId: string, page: number, size: number): Promise<BaseResponse<Page<ProductBacklog>>> {
    const response = await projectHubService.get(`/product_backlog/${projectId}`, {
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

  async createProductBacklog(token: string, projectId: string, data: CreateProductBacklogRequestDTO): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.post(`/product_backlog/${projectId}`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async reorderProductBacklog(token: string, projectId: string, data: UpdateProductBacklogPositionRequestDTO): Promise<BaseResponse<void>> {
    const response = await projectHubService.patch(`/product_backlog/${projectId}/reorder`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

}
