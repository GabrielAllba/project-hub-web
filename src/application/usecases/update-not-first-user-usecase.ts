import type { BaseResponse } from "@/domain/dto/base-response";
import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";

export class UpdateNotFirstUserUseCase {
  constructor(private readonly authRepo: AuthenticationServiceRepository) {}

  async execute(token: string): Promise<BaseResponse<{ message: string }>> {
    return this.authRepo.updateNotFirstUser(token);
  }
}
