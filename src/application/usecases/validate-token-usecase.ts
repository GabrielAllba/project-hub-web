import { AuthenticationApiRepository } from "@/domain/repositories/authentication-api-repository";

export class ValidateTokenUseCase {
  private authRepo: AuthenticationApiRepository;

  constructor(authRepo: AuthenticationApiRepository) {
    this.authRepo = authRepo;
  }

  async execute(token: string): Promise<void> {
    await this.authRepo.validateToken(token);
  }
}
