import { DeleteProjectUseCase } from "@/application/usecases/delete-project-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const deleteProjectUseCase = new DeleteProjectUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { projectId: string } }
): Promise<BaseResponse<void>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await deleteProjectUseCase.execute(token, arg.projectId);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<void>(err);
    }
}

export function useDeleteProject(projectId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/project/${projectId}`, fetcher);

    const triggerDeleteProject = async (idProject: string): Promise<BaseResponse<void>> => {
        return await trigger({ projectId: idProject });
    };

    return {
        triggerDeleteProject,
        triggerDeleteProjectResponse: data,
        triggerDeleteProjectLoading: isMutating,
    };
}
