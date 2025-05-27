import { GetMeUseCase } from "@/application/usecases/get-me-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { GetMeResponseDTO } from "@/domain/dto/res/get-me-res";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const getMeUseCase = new GetMeUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg: token }: { arg: string }
): Promise<BaseResponse<GetMeResponseDTO>> {
    try {
        const result = await getMeUseCase.execute(token);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<GetMeResponseDTO>(err);
    }
}

export function useGetMe() {
    const { trigger, data, isMutating } = useSWRMutation(
        "/auth/me",
        fetcher
    );

    const triggerGetMe = async (): Promise<BaseResponse<GetMeResponseDTO>> => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }
        return await trigger(token);
    };

    return {
        triggerGetMe,
        triggerGetMeResponse: data,
        triggerGetMeloading: isMutating,
    };
}