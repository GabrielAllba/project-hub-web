
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Project } from "@/domain/entities/project";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { GetProjectByIdUseCase } from '../../application/usecases/get-project-by-id-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getProjectByIdUseCase = new GetProjectByIdUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, projectId } }: { arg: { token: string; projectId: string; } },
): Promise<BaseResponse<Project>> {
    try {
        return await getProjectByIdUseCase.execute(token, projectId);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Project>(err);
    }
}
export function useGetProjectById(projectId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/project/${projectId}`, fetcher)

    const triggerGetProjectById = async (idSprint: string): Promise<BaseResponse<Project>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, projectId: idSprint });
    };

    return {
        triggerGetProjectById,
        triggerGetProjectByIdResponse: data,
        triggerGetProjectByIdLoading: isMutating,
    };
}