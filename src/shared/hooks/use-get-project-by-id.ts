
import type { BaseResponse } from "@/domain/dto/base-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { GetProjectByIdUseCase } from '../../application/usecases/get-project-by-id-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getProjectByIdUseCase = new GetProjectByIdUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, projectId } }: { arg: { token: string; projectId: string; } },
): Promise<BaseResponse<ProjectSummary>> {
    return await getProjectByIdUseCase.execute(token, projectId);
}
export function useGetProjectById(projectId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/project/${projectId}`, fetcher)

    const triggerGetProjectById = async (idSprint: string): Promise<BaseResponse<ProjectSummary>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        try {
            return await trigger({ token, projectId: idSprint });
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<ProjectSummary>(err)
        }
    };

    return {
        triggerGetProjectById,
        triggerGetProjectByIdResponse: data,
        triggerGetProjectByIdLoading: isMutating,
    };
}