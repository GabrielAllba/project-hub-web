import { LoginUseCase } from "@/application/usecases/login-usecase";
import type { BaseResponse } from "@/domain/dto/base-response";
import type { LoginRequestDTO } from "@/domain/dto/req/login-req";
import type { LoginResponseDTO } from "@/domain/dto/res/login-res";
import { AuthenticationApiRepository } from "@/domain/repositories/authentication-api-repository";
import useSWRMutation from "swr/mutation";
import { convertAxiosErrorToBaseResponse } from "../lib/utils";

const loginUseCase = new LoginUseCase(new AuthenticationApiRepository());

async function loginFetcher(
  _: string,
  { arg }: { arg: LoginRequestDTO }
): Promise<BaseResponse<LoginResponseDTO>> {
  try {
    const result = await loginUseCase.execute(arg);
    return {
      status: 200,
      message: "Login successful",
      data: {
        accessToken: result.data?.accessToken,
      },
    };
  } catch (err) {
    return convertAxiosErrorToBaseResponse<LoginResponseDTO>(err, "Login failed");
  }
}

export function useLogin() {
  const { trigger, data, isMutating } = useSWRMutation(
    "/auth/login",
    loginFetcher
  );

  const execute = async (
    payload: LoginRequestDTO
  ): Promise<BaseResponse<LoginResponseDTO>> => {
    return await trigger(payload);
  };

  return {
    execute,
    data,
    loading: isMutating,
  };
}
