
import { GetMyProjectUseCase } from "@/application/usecases/get-my-projects-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getMyProjectUseCase = new GetMyProjectUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: { token, page, size } }: { arg: { token: string; page: number; size: number } }
): Promise<BaseResponse<Page<ProjectSummary>>> {
    try {
        return await getMyProjectUseCase.execute(token, page, size);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<ProjectSummary>>(err);
    }
}


export function useGetMyProject() {
    const { trigger, data, isMutating } = useSWRMutation("/project/my", fetcher);

    const triggerGetMyProject = async (page: number, size: number): Promise<BaseResponse<Page<ProjectSummary>>> => {
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