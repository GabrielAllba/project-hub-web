import type { BaseResponse } from "@/domain/dto/base-response";
import type { AddProductOwnerRequestDTO } from "@/domain/dto/req/add-product-owner-req";
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res";
import { ProjectHubServiceRepository } from "@/infrastructure/repositories/projecthub-service-repository";
import useSWRMutation from "swr/mutation";
import { InviteProductOwnerUseCase } from '../../application/usecases/invite-product-owner-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const inviteProductOwnerUseCase = new InviteProductOwnerUseCase(new ProjectHubServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: { dto: AddProductOwnerRequestDTO; projectId: string } }
): Promise<BaseResponse<InvitationResponseDTO[]>> {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const result = await inviteProductOwnerUseCase.execute(token, arg.projectId, arg.dto);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<InvitationResponseDTO[]>(err);
    }
}

export function useInviteProductOwner(projectId: string) {
    const { trigger, data, error, isMutating } = useSWRMutation(`/project/${projectId}/product_owner/invite`, fetcher);

    const triggerInviteProductOwner = async (
        dto: AddProductOwnerRequestDTO,
    ): Promise<BaseResponse<InvitationResponseDTO[]>> => {
        return await trigger({ dto, projectId });
    };

    return {
        triggerInviteProductOwner,
        triggerInviteProductOwnerError: error,
        triggerInviteProductOwnerResponse: data,
        triggerInviteProductOwnerLoading: isMutating,
    };
}
