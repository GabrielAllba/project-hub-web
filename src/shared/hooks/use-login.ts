import { LoginUseCase } from "@/application/usecases/login-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { LoginRequestDTO } from "@/domain/dto/req/login-req";
import type { LoginResponseDTO } from "@/domain/dto/res/login-res";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../lib/utils";

const loginUseCase = new LoginUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: LoginRequestDTO }
): Promise<BaseResponse<LoginResponseDTO>> {
    try {
        const result = await loginUseCase.execute(arg);
        return {
            status: result.status,
            message: "Login successful",
            data: {
                accessToken: result.data?.accessToken,
            },
        };
    } catch (err) {
        return convertAxiosErrorToBaseResponse<LoginResponseDTO>(err);
    }
}

export function useLogin() {
    const { trigger, data, isMutating } = useSWRMutation(
        "/auth/login",
        fetcher
    );

    const triggerLogin = async (
        payload: LoginRequestDTO
    ): Promise<BaseResponse<LoginResponseDTO>> => {
        return await trigger(payload);
    };

    return {
        triggerLogin,
        triggerLoginResponse: data,
        triggerLoginLoading: isMutating,
    };
}