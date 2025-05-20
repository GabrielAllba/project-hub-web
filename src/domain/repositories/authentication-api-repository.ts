import { authenticationService } from "../../infrastructure/http/authentication-service";
import type { BaseResponse } from "../dto/base-response";
import type { LoginRequestDTO } from "../dto/req/login-req";
import type { GetMeResponseDTO } from "../dto/res/get-me-res";
import type { LoginResponseDTO } from "../dto/res/login-res";

export class AuthenticationApiRepository {
  async login(data: LoginRequestDTO): Promise<BaseResponse<LoginResponseDTO>> {
    const response = await authenticationService.post<BaseResponse<LoginResponseDTO>>("/auth/login", data);
    return response.data;
  }
  async validateToken(token: string): Promise<BaseResponse<{message: string}>> {
    const response = await authenticationService.get("/auth/validate_token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
  async getMe(token: string): Promise<BaseResponse<GetMeResponseDTO>> {
    const response = await authenticationService.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}
