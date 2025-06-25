import { FindUserByEmailUseCase } from "@/application/usecases/find-user-by-email-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { FindUserResponseDTO } from "@/domain/dto/res/find-user-res";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const findUserByEmailUseCase = new FindUserByEmailUseCase(
    new AuthenticationServiceRepository()
);

async function fetcher(
    _: string,
    { arg }: { arg: string }
): Promise<BaseResponse<FindUserResponseDTO>> {
    try {
        const result = await findUserByEmailUseCase.execute(arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<FindUserResponseDTO>(err);
    }
}

export function useFindUserByEmail() {
    const { trigger, data, isMutating } = useSWRMutation(
        "/auth/find-user-by-email",
        fetcher
    );

    const triggerFindUserByEmail = async (
        email: string
    ): Promise<BaseResponse<FindUserResponseDTO>> => {
        return await trigger(email);
    };

    return {
        triggerFindUserByEmail,
        triggerFindUserByEmailResponse: data,
        triggerFindUserByEmailLoading: isMutating,
    };
}
