import { authenticationService } from "../../infrastructure/http/authentication-service";
import type { BaseResponse } from "../dto/base-response";
import type { LoginRequestDTO } from "../dto/req/login-req";
import type { LoginResponseDTO } from "../dto/res/login-res";

export class AuthenticationApiRepository {
  async login(data: LoginRequestDTO): Promise<BaseResponse<LoginResponseDTO>> {
    const response = await authenticationService.post<BaseResponse<LoginResponseDTO>>("/auth/login", data);
    return response.data;
  }
  async validateToken(token: string): Promise<void> {
    const response = await authenticationService.get("/auth/validate_token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}
