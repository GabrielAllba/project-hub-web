import type { BaseResponse } from "@/domain/dto/base-response";
import type { FindUserResponseDTO } from "@/domain/dto/res/find-user-res";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import useSWRMutation from "swr/mutation";
import { SearchUsersUseCase } from '../../application/usecases/searceh-users-usecase';
import { convertAxiosErrorToBaseResponse } from "../utils/axios-utils";

const searchUsersUseCase = new SearchUsersUseCase(new AuthenticationServiceRepository());

async function fetcher(
    _: string,
    { arg }: { arg: string }
): Promise<BaseResponse<FindUserResponseDTO[]>> {
    try {
        const result = await searchUsersUseCase.execute(arg);
        return result;
    } catch (err) {
        return convertAxiosErrorToBaseResponse<FindUserResponseDTO[]>(err);
    }
}

export function useSearchUsers() {
    const { trigger, data, isMutating } = useSWRMutation(
        "/auth/search-users",
        fetcher
    );

    const triggerSearchUsers = async (
        query: string
    ): Promise<BaseResponse<FindUserResponseDTO[]>> => {
        return await trigger(query);
    };

    return {
        triggerSearchUsers,
        triggerSearchUsersResponse: data,
        triggerSearchUsersLoading: isMutating,
    };
}