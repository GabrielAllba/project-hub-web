import type { CreateTeamRequestDTO } from "@/domain/dto/req/create-team-req";
import type { Team } from "@/domain/entities/team";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class CreateTeamUseCase {
  constructor(private readonly projectHubRepo: ProjectHubServiceRepository) {}

  async execute(token: string, data: CreateTeamRequestDTO): Promise<BaseResponse<Team>> {
    return this.projectHubRepo.createTeam(token, data);
  }
}