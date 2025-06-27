import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";


import type { ProjectSummary } from "@/domain/entities/project-summary";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { SearchArchivedProjectsUseCase } from '../../application/usecases/search-archived-projects-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const searchArchivedProjectsUseCase = new SearchArchivedProjectsUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    {
        arg: { token, keyword, page, size },
    }: {
        arg: { token: string; keyword: string; page: number; size: number };
    }
): Promise<BaseResponse<Page<ProjectSummary>>> {
    try {
        return await searchArchivedProjectsUseCase.execute(token, keyword, page, size);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<ProjectSummary>>(err);
    }
}

export function useSearchArchivedProjects() {
    const { trigger, data, isMutating, error } = useSWRMutation("/project/search/archived", fetcher);

    const triggerSearchArchivedProjects = async (
        keyword: string,
        page: number = 0,
        size: number = 10
    ): Promise<BaseResponse<Page<ProjectSummary>>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, keyword, page, size });
    };

    return {
        triggerSearchArchivedProjects,
        searchArchivedProjectsResponse: data,
        searchArchivedProjectsLoading: isMutating,
        searchArchivedProjectsError: error,
    };
}
