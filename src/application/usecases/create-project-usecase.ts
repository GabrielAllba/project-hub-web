import type { CreateProjectRequestDTO } from "@/domain/dto/req/create-project-req";
import type { Project } from "@/domain/entities/project";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class CreateProjectUseCase {
  constructor(private readonly projectHubRepo: ProjectHubServiceRepository) {}

  async execute(token: string, data: CreateProjectRequestDTO): Promise<BaseResponse<Project>> {
    return this.projectHubRepo.createProject(token, data);
  }
}