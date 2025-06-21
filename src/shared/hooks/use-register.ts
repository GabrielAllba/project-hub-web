import type { BaseResponse } from "@/domain/dto/base-response";
import type { RegisterRequestDTO } from "@/domain/dto/req/register-req";
import type { RegisterResponseDTO } from "@/domain/dto/res/register-res";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { RegisterUseCase } from '../../application/usecases/register-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const registerUseCase = new RegisterUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: RegisterRequestDTO }
): Promise<BaseResponse<RegisterResponseDTO>> {
    try {
        const result = await registerUseCase.execute(arg);
        return result
    } catch (err) {
        return convertAxiosErrorToBaseResponse<RegisterResponseDTO>(err);
    }
}

export function useRegister() {
    const { trigger, data, isMutating } = useSWRMutation(
        "/auth/register",
        fetcher
    );

    const triggerRegister = async (
        payload: RegisterRequestDTO
    ): Promise<BaseResponse<RegisterResponseDTO>> => {
        return await trigger(payload);
    };

    return {
        triggerRegister,
        triggerRegisterResponse: data,
        triggerRegisterLoading: isMutating,
    };
}