import type { FindUserResponseDTO } from "@/domain/dto/res/find-user-res";
import type { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import type { BaseResponse } from "../../domain/dto/base-response";

export class SearchUsersUseCase {
    constructor(private readonly authRepo: AuthenticationServiceRepository) { }

    async execute(id: string): Promise<BaseResponse<FindUserResponseDTO[]>> {
        return this.authRepo.searchUsers(id);
    }
}