import { FindUserUseCase } from "@/application/usecases/find-user-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { FindUserResponseDTO } from "@/domain/dto/res/find-user-res";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const findUserUseCase = new FindUserUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: string }
): Promise<BaseResponse<FindUserResponseDTO>> {
    try {
        const result = await findUserUseCase.execute(arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<FindUserResponseDTO>(err);
    }
}

export function useFindUser() {
    const { trigger, data, isMutating } = useSWRMutation(
        "/auth/user",
        fetcher
    );

    const triggerFindUser = async (
        payload: string
    ): Promise<BaseResponse<FindUserResponseDTO>> => {
        return await trigger(payload);
    };

    return {
        triggerFindUser,
        triggerFindUserResponse: data,
        triggerFindUserLoading: isMutating,
    };
}