import { MoveBacklogToSprintUseCase } from "@/application/usecases/move-backlog-to-sprint-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { MoveBacklogToSprintRequestDTO } from "@/domain/dto/req/move-backlog-to-sprint-req";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const moveBacklogToSprintUseCase = new MoveBacklogToSprintUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { dto: MoveBacklogToSprintRequestDTO; projectId: string } }
): Promise<BaseResponse<void>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await moveBacklogToSprintUseCase.execute(token, arg.projectId, arg.dto);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<void>(err);
    }
}

export function useMoveBacklogToSprint(projectId: string) {
    const { trigger, data, isMutating } = useSWRMutation(`/product_backlog/${projectId}/move_to_sprint`, fetcher);

    const triggerMoveBacklogToSprint = async (
        dto: MoveBacklogToSprintRequestDTO,
    ): Promise<BaseResponse<void>> => {
        return await trigger({ dto, projectId });
    };

    return {
        triggerMoveBacklogToSprint,
        triggerMoveBacklogToSprintResponse: data,
        triggerMoveBacklogToSprintLoading: isMutating,
    };
}
