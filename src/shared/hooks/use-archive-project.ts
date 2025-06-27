import { ArchiveProjectUseCase } from "@/application/usecases/archive-project-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const archiveProjectUseCase = new ArchiveProjectUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, projectId } }: { arg: { token: string; projectId: string } }
): Promise<BaseResponse<void>> {
    return await archiveProjectUseCase.execute(token, projectId);
}

export function useArchiveProject() {
    const { trigger, data, isMutating } = useSWRMutation("/project/archive", fetcher);

    const triggerArchiveProject = async (projectId: string): Promise<BaseResponse<void>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");
        try {
            return await trigger({ token, projectId });
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<void>(err);
        }
    };

    return {
        triggerArchiveProject,
        triggerArchiveProjectResponse: data,
        triggerArchiveProjectLoading: isMutating,
    };
}
