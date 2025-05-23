import type { BaseResponse } from "@/domain/dto/base-response";
import type { LoginRequestDTO } from "@/domain/dto/req/login-req";
import type { GetMeResponseDTO } from "@/domain/dto/res/get-me-res";
import type { LoginResponseDTO } from "@/domain/dto/res/login-res";
import { authenticationServices } from "../api/authentication-services";

export class AuthenticationServiceRepository {
  async login(data: LoginRequestDTO): Promise<BaseResponse<LoginResponseDTO>> {
    const response = await authenticationServices.post<BaseResponse<LoginResponseDTO>>("/auth/login", data);
    return response.data;
  }
  async validateToken(token: string): Promise<BaseResponse<{message: string}>> {
    const response = await authenticationServices.get("/auth/validate_token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
  async getMe(token: string): Promise<BaseResponse<GetMeResponseDTO>> {
    const response = await authenticationServices.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
  async logout(token: string): Promise<BaseResponse<{message: string}>> {
    const response = await authenticationServices.get("/auth/logout", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}