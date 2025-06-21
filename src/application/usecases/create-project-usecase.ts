import type { CreateProjectRequestDTO } from "@/domain/dto/req/create-project-req";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class CreateProjectUseCase {
  constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

  async execute(token: string, data: CreateProjectRequestDTO): Promise<BaseResponse<ProjectSummary>> {
    return this.projectHubRepo.createProject(token, data);
  }
}