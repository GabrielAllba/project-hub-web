import type { FindUserResponseDTO } from "@/domain/dto/res/find-user-res";
import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import type { BaseResponse } from "@/domain/dto/base-response";

export class FindUserByEmailUseCase {
  constructor(private readonly authRepo: AuthenticationServiceRepository) {}

  async execute(email: string): Promise<BaseResponse<FindUserResponseDTO>> {
    return this.authRepo.findUserByEmail(email);
  }
}
