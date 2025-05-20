import { GetMeUseCase } from "@/application/usecases/get-me-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { GetMeResponseDTO } from "@/domain/dto/res/get-me-res";
import { AuthenticationApiRepository } from "@/domain/repositories/authentication-api-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../lib/utils";

const getMeUseCase = new GetMeUseCase(new AuthenticationApiRepository());

async function getMeFetcher(
  _: string,
  { arg: token }: { arg: string }
): Promise<BaseResponse<GetMeResponseDTO>> {
  try {
    const result = await getMeUseCase.execute(token);
    return {
      status: 200,
      message: "User fetched successfully",
      data: {
        id: result.data.id,
        username: result.data.username,
        email: result.data.email,
        isEmailVerified: result.data.isEmailVerified
      },
    };
  } catch (err) {
    return convertAxiosErrorToBaseResponse<GetMeResponseDTO>(err, "Failed to fetch user");
  }
}

export function useGetMe() {
  const { trigger, data, isMutating } = useSWRMutation(
    "/auth/me",
    getMeFetcher
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
