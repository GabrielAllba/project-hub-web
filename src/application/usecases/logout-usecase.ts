import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import { type BaseResponse } from '../../domain/dto/base-response';

export class LogoutUseCase {
  private authRepo: AuthenticationServiceRepository;

  constructor(authRepo: AuthenticationServiceRepository) {
    this.authRepo = authRepo;
  }

  async execute(token: string): Promise<BaseResponse<{message: string}>> {
    return await this.authRepo.logout(token);
  }
}