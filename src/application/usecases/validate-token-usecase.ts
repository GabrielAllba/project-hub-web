import type { BaseResponse } from "@/domain/dto/base-response";
import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";

export class ValidateTokenUseCase {
  private authRepo: AuthenticationServiceRepository;

  constructor(authRepo: AuthenticationServiceRepository) {
    this.authRepo = authRepo;
  }

  async execute(token: string): Promise<BaseResponse<{message: string}>> {
    return await this.authRepo.validateToken(token);
  }
}