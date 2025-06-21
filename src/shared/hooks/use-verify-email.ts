import type { BaseResponse } from "@/domain/dto/base-response";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { VerifyEmailUseCase } from '../../application/usecases/verify-email-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const verifyEmailUseCase = new VerifyEmailUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg: { verifyEmailToken } }: { arg: { verifyEmailToken: string } }
): Promise<BaseResponse<void>> {

    const result = await verifyEmailUseCase.execute(verifyEmailToken);
    return result;

}

export function useVerifyEmail() {
    const { trigger, data, isMutating } = useSWRMutation(
        `/auth/verify-email?verifyEmailToken=`,
        fetcher
    );

    const triggerVerifyEmail = async (verifyEmailToken: string): Promise<BaseResponse<void>> => {
        try {
            return await trigger({ verifyEmailToken: verifyEmailToken });
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<void>(err);
        }
    };

    return {
        triggerVerifyEmail,
        triggerVerifyEmailResponse: data,
        triggerVerifyEmailloading: isMutating,
    };
}