import type { ProjectRole } from "@/constants/constants";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { AddDeveloperRequestDTO } from "@/domain/dto/req/add-developer-req";
import type { AddScrumMasterRequestDTO } from "@/domain/dto/req/add-scrum-master-req";
import type { CreateProductBacklogRequestDTO } from "@/domain/dto/req/create-product-backlog-req";
import type { CreateProductGoalRequestDTO } from "@/domain/dto/req/create-product-goal-req";
import type { CreateProjectRequestDTO } from "@/domain/dto/req/create-project-req";
import type { CreateSprintRequestDTO } from "@/domain/dto/req/create-sprint-req";
import type { CreateTeamRequestDTO } from "@/domain/dto/req/create-team-req";
import type { EditBacklogGoalRequestDTO } from "@/domain/dto/req/edit-backlog-goal-req";
import type { EditBacklogPointRequestDTO } from "@/domain/dto/req/edit-backlog-point-req";
import type { EditBacklogPriorityRequestDTO } from "@/domain/dto/req/edit-backlog-priority-req";
import type { EditBacklogTitleRequestDTO } from "@/domain/dto/req/edit-backlog-title-req";
import type { EditSprintGoalAndDatesRequestDTO } from "@/domain/dto/req/edit-sprint-goal-and-dates-req";
import type { RenameProductGoalRequestDTO } from "@/domain/dto/req/rename-product-goal-req";
import type { RenameProjectRequestDTO } from "@/domain/dto/req/rename-project-req";
import type { ReorderProductBacklogRequestDTO } from "@/domain/dto/req/reorder-product-backlog-req";
import type { CompleteSprintInfoResponseDTO } from "@/domain/dto/res/complete-sprint-info-res";
import type { GetMyActiveBacklogResponseDTO } from "@/domain/dto/res/get-my-active-backlog-res";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import type { ProjectBacklogSummaryResponseDTO } from "@/domain/dto/res/project-backlog-summary-res";
import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res";
import type { SprintOverviewResponseDTO } from "@/domain/dto/res/sprint-overview-res";
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res";
import type { UserTaskDistributionResponseDTO } from "@/domain/dto/res/user-task-distribution-res";
import type { UserWorkItemSummaryResponseDTO } from "@/domain/dto/res/user-work-item-summary-res";
import type { ProductBacklog, ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";
import type { ProductGoal } from "@/domain/entities/product-goal";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { Team } from "@/domain/entities/team";
import type { TeamSummary } from "@/domain/entities/team-summary";
import type { AssignBacklogUserRequestDTO } from '../../domain/dto/req/assign-backlog-user-req';
import type { EditBacklogStatusRequestDTO } from '../../domain/dto/req/edit-backlog-status-req';
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

  async createProject(token: string, data: CreateProjectRequestDTO): Promise<BaseResponse<ProjectSummary>> {
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
  async inviteScrumMaster(token: string, projectId: string, data: AddScrumMasterRequestDTO): Promise<BaseResponse<InvitationResponseDTO[]>> {
    const response = await projectHubService.post(
      `/project/${projectId}/scrum_master/invite`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
  async inviteDeveloper(token: string, projectId: string, data: AddDeveloperRequestDTO): Promise<BaseResponse<InvitationResponseDTO[]>> {
    const response = await projectHubService.post(
      `/project/${projectId}/developer/invite`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
  async inviteProductOwner(token: string, projectId: string, data: AddDeveloperRequestDTO): Promise<BaseResponse<InvitationResponseDTO[]>> {
    const response = await projectHubService.post(
      `/project/${projectId}/product_owner/invite`,
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

  async getProductBacklog(
    token: string,
    projectId: string,
    page: number,
    size: number,
    options?: {
      search?: string;
      status?: ProductBacklogStatus;
      priority?: ProductBacklogPriority;
      productGoalIds?: string[];
      assigneeIds?: string[]
    }
  ): Promise<BaseResponse<Page<ProductBacklog>>> {
    const response = await projectHubService.post(
      `/project/${projectId}/product_backlogs`,
      {
        ...options,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          size,
        },
      }
    );

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
  async startSprint(token: string, sprintId: string): Promise<BaseResponse<SprintResponseDTO>> {
    const response = await projectHubService.put(`/sprint/${sprintId}/start`, null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

  async completeSprint(token: string, sprintId: string): Promise<BaseResponse<SprintResponseDTO>> {
    const response = await projectHubService.put(`/sprint/${sprintId}/complete`, null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
  async getCompleteSprintInfo(token: string, sprintId: string): Promise<BaseResponse<CompleteSprintInfoResponseDTO>> {
    const response = await projectHubService.get(`/sprint/${sprintId}/complete_sprint/info`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

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
  async getProjectInvitations(token: string, userId: string, page: number, size: number): Promise<BaseResponse<Page<InvitationResponseDTO>>> {
    const response = await projectHubService.get(`/project_invitation/user/${userId}`, {
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
  async getProjectInvitationById(token: string, invitationId: string): Promise<BaseResponse<InvitationResponseDTO>> {
    const response = await projectHubService.get(`/project_invitation/${invitationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
  async getProjectMembers(
    token: string,
    projectId: string,
    role: ProjectRole
  ): Promise<BaseResponse<ProjectUserResponseDTO[]>> {
    const response = await projectHubService.get(`/project/${projectId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        role: role.toLowerCase(),
      },
    });

    return response.data;
  }
  async getProjectBacklogSummary(
    token: string,
    projectId: string,
  ): Promise<BaseResponse<ProjectBacklogSummaryResponseDTO>> {
    const response = await projectHubService.get(`/project/${projectId}/backlog_summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
  async getProjectWorkSummary(
    token: string,
    projectId: string,
    range: string,
  ): Promise<BaseResponse<UserWorkItemSummaryResponseDTO[]>> {
    const response = await projectHubService.get(`/project/${projectId}/work_summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        range: range,
      },
    });

    return response.data;
  }

  async searchSprints(
    token: string,
    projectId: string,
    keyword: string,
    page: number,
    size: number
  ): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    const response = await projectHubService.get(`/sprint/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        projectId,
        keyword,
        page,
        size,
      },
    });

    return response.data;
  }

  async searchProjects(
    token: string,
    keyword: string,
    page: number,
    size: number
  ): Promise<BaseResponse<Page<ProjectSummary>>> {
    const response = await projectHubService.get(`/project/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        keyword,
        page,
        size,
      },
    });

    return response.data;
  }


  async getMyActiveBacklogs(
    token: string,
    page: number,
    size: number
  ): Promise<BaseResponse<Page<GetMyActiveBacklogResponseDTO>>> {
    const response = await projectHubService.get(`/product_backlog/my/active_sprint`, {
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

  async searchSprintsInTimeline(
    token: string,
    projectId: string,
    keyword: string,
    page: number,
    size: number
  ): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    const response = await projectHubService.get(`/sprint/search/timeline`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        projectId,
        keyword,
        page,
        size,
      },
    });

    return response.data;
  }

  async getProjectSprintsAllStatus(token: string, projectId: string, page: number, size: number): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    const response = await projectHubService.get(`/project/${projectId}/sprints/all-status`, {
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
  async getTimelineProjectSprints(
    token: string,
    projectId: string,
    page: number,
    size: number,
    year: number
  ): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    const response = await projectHubService.get(`/project/${projectId}/sprints/timeline`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        size,
        year,
      },
    });

    return response.data;
  }

  async getProjectSprintsInProgress(token: string, projectId: string, page: number, size: number): Promise<BaseResponse<Page<SprintResponseDTO>>> {
    const response = await projectHubService.get(`/project/${projectId}/sprints/in_progress`, {
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
  async getSprintById(token: string, sprintId: string): Promise<BaseResponse<SprintResponseDTO>> {
    const response = await projectHubService.get(`/sprint/${sprintId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
  async getSprintOverview(token: string, sprintId: string): Promise<BaseResponse<SprintOverviewResponseDTO>> {
    const response = await projectHubService.get(`/sprint/${sprintId}/overview`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
  async getSprintTaskDistribution(token: string, sprintId: string): Promise<BaseResponse<UserTaskDistributionResponseDTO[]>> {
    const response = await projectHubService.get(`/sprint/${sprintId}/task_distribution`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getProjectById(token: string, projectId: string): Promise<BaseResponse<ProjectSummary>> {
    const response = await projectHubService.get(`/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getProductGoalById(token: string, productGoalId: string): Promise<BaseResponse<ProductGoal>> {
    const response = await projectHubService.get(`/product-goal/${productGoalId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getProductBacklogBySprint(
    token: string,
    sprintId: string,
    page: number,
    size: number,
    options?: {
      search?: string;
      status?: ProductBacklogStatus;
      priority?: ProductBacklogPriority;
      productGoalIds?: string[];
      assigneeIds?: string[];
    }
  ): Promise<BaseResponse<Page<ProductBacklog>>> {
    const response = await projectHubService.post(
      `/sprint/${sprintId}/product_backlogs`,
      {
        ...options,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          size,
        },
      }
    );

    return response.data;
  }

  async getProductBacklogById(token: string, backlogId: string): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.get(`/product_backlog/${backlogId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

  async deleteProject(token: string, projectId: string): Promise<BaseResponse<void>> {
    const response = await projectHubService.delete(`/project/${projectId}`, {
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

  async acceptProjectInvitation(token: string, invitationId: string): Promise<BaseResponse<InvitationResponseDTO>> {
    const response = await projectHubService.put(
      `/project/${invitationId}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
  async rejectProjectInvitation(token: string, invitationId: string): Promise<BaseResponse<InvitationResponseDTO>> {
    const response = await projectHubService.put(
      `/project/${invitationId}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

  async editBacklogPoint(token: string, data: EditBacklogPointRequestDTO): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.put(`/product_backlog/edit_backlog_point`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
  async assignBacklogUser(token: string, data: AssignBacklogUserRequestDTO): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.put(`/product_backlog/assign_user`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async editBacklogPriority(token: string, data: EditBacklogPriorityRequestDTO): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.put(`/product_backlog/edit_backlog_priority`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
  async editBacklogStatus(token: string, data: EditBacklogStatusRequestDTO): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.put(`/product_backlog/edit_backlog_status`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async editBacklogTitle(token: string, data: EditBacklogTitleRequestDTO): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.put(`/product_backlog/edit_backlog_title`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async renameProject(token: string, data: RenameProjectRequestDTO): Promise<BaseResponse<ProjectSummary>> {
    const response = await projectHubService.put(`/project/rename`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async editBacklogGoal(token: string, data: EditBacklogGoalRequestDTO): Promise<BaseResponse<ProductBacklog>> {
    const response = await projectHubService.put(`/product_backlog/edit_backlog_goal`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async createProductGoal(token: string, data: CreateProductGoalRequestDTO): Promise<BaseResponse<ProductGoal>> {
    const response = await projectHubService.post(`/product-goal`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async renameProductGoal(token: string, data: RenameProductGoalRequestDTO): Promise<BaseResponse<ProductGoal>> {
    const response = await projectHubService.put(`/product-goal/rename`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async deleteProductGoal(token: string, productGoalId: string): Promise<BaseResponse<void>> {
    const response = await projectHubService.delete(`/product-goal/${productGoalId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getProductGoal(token: string, projectId: string, page: number, size: number): Promise<BaseResponse<Page<ProductGoal>>> {
    const response = await projectHubService.get(`/product-goal/by_project/${projectId}`, {
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
