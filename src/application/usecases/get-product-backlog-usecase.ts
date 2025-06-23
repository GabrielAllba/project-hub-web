import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type {
  ProductBacklog,
  ProductBacklogPriority,
  ProductBacklogStatus,
} from "@/domain/entities/product-backlog";
import type { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

export class GetProductBacklogUseCase {
  constructor(private readonly projectHubRepo: ProjectHubServiceRepository) { }

  async execute(
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
    return await this.projectHubRepo.getProductBacklog(
      token,
      projectId,
      page,
      size,
      options
    );
  }
}
