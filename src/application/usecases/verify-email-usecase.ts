import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import { type BaseResponse } from '../../domain/dto/base-response';

export class VerifyEmailUseCase {
    private authRepo: AuthenticationServiceRepository;

    constructor(authRepo: AuthenticationServiceRepository) {
        this.authRepo = authRepo;
    }

    async execute(verifyEmailToken: string): Promise<BaseResponse<void>> {
        return await this.authRepo.verifyEmail(verifyEmailToken);
    }
}