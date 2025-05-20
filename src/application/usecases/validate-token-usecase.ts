import type { BaseResponse } from "@/domain/dto/base-response";
import { AuthenticationApiRepository } from "@/domain/repositories/authentication-api-repository";

export class ValidateTokenUseCase {
  private authRepo: AuthenticationApiRepository;

  constructor(authRepo: AuthenticationApiRepository) {
    this.authRepo = authRepo;
  }

  async execute(token: string): Promise<BaseResponse<{message: string}>> {
    return await this.authRepo.validateToken(token);
  }
}
