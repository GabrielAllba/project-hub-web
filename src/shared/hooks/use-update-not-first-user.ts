import { UpdateNotFirstUserUseCase } from "@/application/usecases/update-not-first-user-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const updateNotFirstUserUseCase = new UpdateNotFirstUserUseCase(
    new AuthenticationServiceRepository()
);

async function fetcher(): Promise<BaseResponse<{ message: string }>> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found");
    }

    const result = await updateNotFirstUserUseCase.execute(token);
    return result;
}

export function useUpdateNotFirstUser() {
    const { trigger, data, error, isMutating } = useSWRMutation(
        "/auth/not-first-user",
        fetcher
    );

    const triggerUpdateNotFirstUser = async (): Promise<BaseResponse<{ message: string }>> => {
        try {
            return await trigger();
        } catch (err) {

            throw convertAxiosErrorToBaseResponse<{ message: string }>(err);
        }
    };

    return {
        triggerUpdateNotFirstUser,
        updateNotFirstUserError: error,
        updateNotFirstUserResponse: data,
        updateNotFirstUserLoading: isMutating,
    };
}
