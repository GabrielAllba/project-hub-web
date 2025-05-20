import type { GetMeResponseDTO } from "@/domain/dto/res/get-me-res";
import { AuthenticationApiRepository } from "@/domain/repositories/authentication-api-repository";
import { type BaseResponse } from '../../domain/dto/base-response';

export class GetMeUseCase {
  private authRepo: AuthenticationApiRepository;

  constructor(authRepo: AuthenticationApiRepository) {
    this.authRepo = authRepo;
  }

  async execute(token: string): Promise<BaseResponse<GetMeResponseDTO>> {
    return await this.authRepo.getMe(token);
  }
}
