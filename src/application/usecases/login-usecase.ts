import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";
import type { LoginRequestDTO } from "../../domain/dto/req/login-req";
import type { LoginResponseDTO } from "../../domain/dto/res/login-res";

export class LoginUseCase {
  constructor(private readonly authRepo: AuthenticationServiceRepository) {}

  async execute(data: LoginRequestDTO): Promise<BaseResponse<LoginResponseDTO>> {
    return this.authRepo.login(data);
  }
}