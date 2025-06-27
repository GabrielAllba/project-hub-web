
import { GetArchivedProjectsUseCase } from "@/application/usecases/get-archive-projects-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getArchivedProjectsUseCase = new GetArchivedProjectsUseCase(new ProjectHubServiceRepository());

async function fetcher(
  _: string,
  { arg: { token, page, size } }: { arg: { token: string; page: number; size: number } }
): Promise<BaseResponse<Page<ProjectSummary>>> {

  return await getArchivedProjectsUseCase.execute(token, page, size);

}

export function useGetArchivedProjects() {
  const { trigger, data, isMutating } = useSWRMutation("/project/archived", fetcher);

  const triggerGetArchivedProjects = async (
    page: number,
    size: number
  ): Promise<BaseResponse<Page<ProjectSummary>>> => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    try {
      return await trigger({ token, page, size });
    } catch (err) {
      throw convertAxiosErrorToBaseResponse<Page<ProjectSummary>>(err);
    }
  };

  return {
    triggerGetArchivedProjects,
    triggerGetArchivedProjectsResponse: data,
    triggerGetArchivedProjectsLoading: isMutating,
  };
}
