import type { GetMeResponseDTO } from "@/domain/dto/res/get-me-res";
import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import { type BaseResponse } from '../../domain/dto/base-response';

export class GetMeUseCase {
  private authRepo: AuthenticationServiceRepository;

  constructor(authRepo: AuthenticationServiceRepository) {
    this.authRepo = authRepo;
  }

  async execute(token: string): Promise<BaseResponse<GetMeResponseDTO>> {
    return await this.authRepo.getMe(token);
  }
}