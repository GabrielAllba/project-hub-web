import { GetMyProjectUseCase } from "@/application/usecases/get-my-project";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import { ProjectHubApiRepository } from "@/domain/repositories/project-hub-api-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../lib/utils";

const getMyProjectUseCase = new GetMyProjectUseCase(new ProjectHubApiRepository());

async function fetcher(
  _: string,
  { arg: token }: { arg: string }
): Promise<BaseResponse<Page<ProjectSummary>>> {
  try {
    return await getMyProjectUseCase.getProjectForSidebar(token);
  } catch (err) {
    return convertAxiosErrorToBaseResponse<Page<ProjectSummary>>(err, "Failed to fetch sidebar projects");
  }
}
export function useGetMyProjectSidebar() {
  const { trigger, data, isMutating } = useSWRMutation("/project/sidebar", fetcher);

  const triggerSidebarProjects = async (): Promise<BaseResponse<Page<ProjectSummary>>> => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    return await trigger(token);
  };

  return {
    triggerSidebarProjects,
    sidebarProjectsResponse: data,
    sidebarProjectsLoading: isMutating,
  };
}
