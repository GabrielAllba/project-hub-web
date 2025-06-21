import { LoginUseCase } from "@/application/usecases/login-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { LoginRequestDTO } from "@/domain/dto/req/login-req";
import type { LoginResponseDTO } from "@/domain/dto/res/login-res";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const loginUseCase = new LoginUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: LoginRequestDTO }
): Promise<BaseResponse<LoginResponseDTO>> {
    const result = await loginUseCase.execute(arg);
    return {
        status: result.status,
        message: "Login successful",
        data: {
            accessToken: result.data?.accessToken,
        },
    };
}


export function useLogin() {
    const { trigger, data, error, isMutating } = useSWRMutation(
        "/auth/login",
        fetcher
    );

    const triggerLogin = async (
        payload: LoginRequestDTO
    ): Promise<BaseResponse<LoginResponseDTO>> => {
        try {
            return await trigger(payload);
        } catch (err) {
            throw convertAxiosErrorToBaseResponse<LoginResponseDTO>(err);
        }
    };

    return {
        triggerLogin,
        triggerLoginErrror: error,
        triggerLoginResponse: data,
        triggerLoginLoading: isMutating,
    };
}
