import type { BaseResponse } from "../../domain/dto/base-response";
import type { LoginRequestDTO } from "../../domain/dto/req/login-req";
import type { LoginResponseDTO } from "../../domain/dto/res/login-res";
import type { AuthenticationApiRepository } from "../../domain/repositories/authentication-api-repository";

export class LoginUseCase {
  constructor(private readonly authRepo: AuthenticationApiRepository) {}

  async execute(data: LoginRequestDTO): Promise<BaseResponse<LoginResponseDTO>> {
    return this.authRepo.login(data);
  }
}
