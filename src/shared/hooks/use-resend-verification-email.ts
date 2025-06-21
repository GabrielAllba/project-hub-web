import { ResendVerificationEmailUseCase } from "@/application/usecases/resend-verification-email-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { ResendVerificationRequestDTO } from "@/domain/dto/req/resend-verification-req";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
    new AuthenticationServiceRepository()
);

async function fetcher(
    _: string,
    { arg }: { arg: ResendVerificationRequestDTO }
): Promise<BaseResponse<{ message: string }>> {
    const result = await resendVerificationEmailUseCase.execute(arg);
    return {
        status: result.status,
        message: result.message ?? "Verification email resent",
        data: result.data,
    };
}

export function useResendVerificationEmail() {
    const { trigger, data, error, isMutating } = useSWRMutation(
        "/auth/resend-verification",
        fetcher
    );

    const triggerResendVerificationEmail = async (
        payload: ResendVerificationRequestDTO
    ): Promise<BaseResponse<{ message: string }>> => {
        try {
            return await trigger(payload);
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<{ message: string }>(err);
        }
    };

    return {
        triggerResendVerificationEmail,
        triggerResendVerificationError: error,
        triggerResendVerificationResponse: data,
        triggerResendVerificationLoading: isMutating,
    };
}
