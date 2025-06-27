import type { BaseResponse } from "@/domain/dto/base-response";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { UnarchiveProjectUseCase } from '../../application/usecases/unarchive-project-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const unarchiveProjectUseCase = new UnarchiveProjectUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, projectId } }: { arg: { token: string; projectId: string } }
): Promise<BaseResponse<void>> {
    return await unarchiveProjectUseCase.execute(token, projectId);
}

export function useUnarchiveProject() {
    const { trigger, data, isMutating } = useSWRMutation("/project/unarchive", fetcher);

    const triggerUnarchiveProject = async (projectId: string): Promise<BaseResponse<void>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");
        try {
            return await trigger({ token, projectId });
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<void>(err);
        }
    };

    return {
        triggerUnarchiveProject,
        triggerUnarchiveProjectResponse: data,
        triggerUnarchiveProjectLoading: isMutating,
    };
}
