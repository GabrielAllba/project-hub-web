import type { BaseResponse } from "@/domain/dto/base-response";
import type { Page } from "@/domain/dto/page-response";

import { GetMyActiveBacklogsUseCase } from "@/application/usecases/get-my-active-backlogs-usecase";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";

import useSWRMutation from "swr/mutation";
import { type GetMyActiveBacklogResponseDTO } from '../../domain/dto/res/get-my-active-backlog-res';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getMyActiveBacklogsUseCase = new GetMyActiveBacklogsUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    {
        arg: { token, page, size },
    }: {
        arg: { token: string; page: number; size: number };
    }
): Promise<BaseResponse<Page<GetMyActiveBacklogResponseDTO>>> {
    try {
        return await getMyActiveBacklogsUseCase.execute(token, page, size);
    } catch (err) {
        return convertAxiosErrorToBaseResponse<Page<GetMyActiveBacklogResponseDTO>>(err);
    }
}

export function useGetMyActiveBacklogs() {
    const { trigger, data, isMutating, error } = useSWRMutation(`/product_backlog/my/active-sprint`, fetcher);

    const triggerGetMyActiveBacklogs = async (
        page: number = 0,
        size: number = 10
    ): Promise<BaseResponse<Page<GetMyActiveBacklogResponseDTO>>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        return await trigger({ token, page, size });
    };

    return {
        triggerGetMyActiveBacklogs,
        myActiveBacklogsResponse: data,
        myActiveBacklogsLoading: isMutating,
        myActiveBacklogsError: error,
    };
}
