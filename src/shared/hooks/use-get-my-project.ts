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
  { arg: { token, page, size } }: { arg: { token: string; page?: number; size?: number } }
): Promise<BaseResponse<Page<ProjectSummary>>> {
  try {
    return await getMyProjectUseCase.execute(token, page ?? 0, size ?? 10);
  } catch (err) {
    return convertAxiosErrorToBaseResponse<Page<ProjectSummary>>(err, "Failed to fetch my project");
  }
}


export function useGetMyProject() {
  const { trigger, data, isMutating } = useSWRMutation("/project/my", fetcher);

  const triggerGetMyProject = async (page = 0, size = 10): Promise<BaseResponse<Page<ProjectSummary>>> => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    return await trigger({ token, page, size });
  };

  return {
    triggerGetMyProject,
    triggerGetMyProjectResponse: data,
    triggerGetMyProjectLoading: isMutating,
  };
}
