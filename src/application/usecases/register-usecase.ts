import type { RegisterRequestDTO } from "@/domain/dto/req/register-req";
import type { RegisterResponseDTO } from "@/domain/dto/res/register-res";
import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class RegisterUseCase {
    constructor(private readonly authRepo: AuthenticationServiceRepository) { }

    async execute(data: RegisterRequestDTO): Promise<BaseResponse<RegisterResponseDTO>> {
        return this.authRepo.register(data);
    }
}