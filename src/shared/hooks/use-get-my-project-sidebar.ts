
import { GetMySidebarProjectUseCase } from "@/application/usecases/get-my-sidebar-projects-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";
import type { ProjectSummary } from "@/domain/entities/project-summary";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../lib/utils";

const getMySidebarProjectUseCase = new GetMySidebarProjectUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg: token }: { arg: string }
): Promise<BaseResponse<Page<ProjectSummary>>> {
    try {
        return await getMySidebarProjectUseCase.execute(token);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<ProjectSummary>>(err);
    }
}
export function useGetMyProjectSidebar() {
    const { trigger, data, isMutating } = useSWRMutation("/project/sidebar", fetcher);

    const triggerSidebarProjects = async (): Promise<BaseResponse<Page<ProjectSummary>>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger(token);
    };

    return {
        triggerSidebarProjects,
        sidebarProjectsResponse: data,
        sidebarProjectsLoading: isMutating,
    };
}