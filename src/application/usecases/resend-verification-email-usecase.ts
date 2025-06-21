import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import type { ResendVerificationRequestDTO } from "@/domain/dto/req/resend-verification-req";
import type { BaseResponse } from "@/domain/dto/base-response";

export class ResendVerificationEmailUseCase {
  constructor(private readonly authRepo: AuthenticationServiceRepository) {}

  async execute(
    dto: ResendVerificationRequestDTO
  ): Promise<BaseResponse<{ message: string }>> {
    return this.authRepo.resendVerificationEmail(dto);
  }
}
