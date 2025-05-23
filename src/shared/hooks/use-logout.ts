import type { BaseResponse } from "@/domain/dto/base-response";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { LogoutUseCase } from '../../application/usecases/logout-usecase';
import { convertAxiosErrorToBaseResponse } from "../lib/utils";

const logoutUseCase = new LogoutUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg: token }: { arg: string }
): Promise<BaseResponse<{ message: string }>> {
    try {
        const result = await logoutUseCase.execute(token);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<{ message: string }>(err);
    }
}

export function useLogout() {
    const { trigger, data, isMutating } = useSWRMutation(
        "/auth/logout",
        fetcher
    );

    const triggerLogout = async (): Promise<BaseResponse<{ message: string }>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }
        return await trigger(token);
    };

    return {
        triggerLogout,
        triggerLogoutResponse: data,
        triggerLogoutloading: isMutating,
    };
}