import { CreateProjectUseCase } from "@/application/usecases/create-project-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { CreateProjectRequestDTO } from "@/domain/dto/req/create-project-req";
import type { Project } from "@/domain/entities/project";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../lib/utils";

const createProjectUseCase = new CreateProjectUseCase(new ProjectHubServiceRepository());

async function fetcher(
  _: string,
  { arg }: { arg: CreateProjectRequestDTO }
): Promise<BaseResponse<Project>> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found");
    }

    const result = await createProjectUseCase.execute(token, arg);
    return result;
  } catch (err) {
    return convertAxiosErrorToBaseResponse<Project>(err);
  }
}

export function useCreateProject() {
  const { trigger, data, isMutating } = useSWRMutation("/projects/create", fetcher);

  const triggerCreateProject = async (payload: CreateProjectRequestDTO): Promise<BaseResponse<Project>> => {
    return await trigger(payload);
  };

  return {
    triggerCreateProject,
    triggerCreateProjectResponse: data,
    triggerCreateProjectLoading: isMutating,
  };
}
