import type { BaseResponse } from "@/domain/dto/base-response";
import type { RenameProjectRequestDTO } from "@/domain/dto/req/rename-project-req";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { RenameProjectUseCase } from '../../application/usecases/rename-project-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const renameProjectUseCase = new RenameProjectUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: RenameProjectRequestDTO }
): Promise<BaseResponse<ProjectSummary>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await renameProjectUseCase.execute(token, arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<ProjectSummary>(err);
    }
}

export function useRenameProject() {
    const { trigger, data, isMutating } = useSWRMutation("/project/rename", fetcher);

    const triggerRenameProject = async (payload: RenameProjectRequestDTO): Promise<BaseResponse<ProjectSummary>> => {
        return await trigger(payload);
    };

    return {
        triggerRenameProject,
        triggerRenameProjectResponse: data,
        triggerRenameProjectLoading: isMutating,
    };
}
