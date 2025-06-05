import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { CreateProductBacklogRequestDTO } from "@/domain/dto/req/create-product-backlog-req";
import type { CreateProjectRequestDTO } from "@/domain/dto/req/create-project-req";
import type { CreateSprintRequestDTO } from "@/domain/dto/req/create-sprint-req";
import type { CreateTeamRequestDTO } from "@/domain/dto/req/create-team-req";
import type { EditSprintGoalAndDatesRequestDTO } from "@/domain/dto/req/edit-sprint-goal-and-dates-req";
import type { ReorderProductBacklogRequestDTO } from "@/domain/dto/req/reorder-product-backlog-req";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
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

  async createSprint(token: string, data: CreateSprintRequestDTO): Promise<BaseResponse<SprintResponseDTO>> {
    const response = await projectHubService.post(`/sprint`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getProjectSprints(token: string, projectId: string, page: number, size: number): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    const response = await projectHubService.get(`/project/${projectId}/sprints`, {
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

  async getProductBacklogBySprint(token: string, sprintId: string, page: number, size: number): Promise<BaseResponse<Page<ProductBacklog>>> {
    const response = await projectHubService.get(`/sprint/${sprintId}/product_backlogs`, {
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

  async deleteBacklog(token: string, backlogId: string): Promise<BaseResponse<void>> {
    const response = await projectHubService.delete(`/product_backlog/${backlogId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async reorderProductBacklog(token: string, data: ReorderProductBacklogRequestDTO): Promise<BaseResponse<void>> {
    const response = await projectHubService.put(`/product_backlog/reorder`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async editSprintGoalAndDates(token: string, data: EditSprintGoalAndDatesRequestDTO): Promise<BaseResponse<SprintResponseDTO>> {
    const response = await projectHubService.put(`/sprint/edit_goal_and_dates`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }


}
