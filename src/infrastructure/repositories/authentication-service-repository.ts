import type { BaseResponse } from "@/domain/dto/base-response";
import type { LoginRequestDTO } from "@/domain/dto/req/login-req";
import type { RegisterRequestDTO } from "@/domain/dto/req/register-req";
import type { ResendVerificationRequestDTO } from "@/domain/dto/req/resend-verification-req";
import type { FindUserResponseDTO } from "@/domain/dto/res/find-user-res";
import type { GetMeResponseDTO } from "@/domain/dto/res/get-me-res";
import type { LoginResponseDTO } from "@/domain/dto/res/login-res";
import type { RegisterResponseDTO } from "@/domain/dto/res/register-res";
import { authenticationServices } from "../api/authentication-services";

export class AuthenticationServiceRepository {
  async login(data: LoginRequestDTO): Promise<BaseResponse<LoginResponseDTO>> {
    const response = await authenticationServices.post<BaseResponse<LoginResponseDTO>>("/auth/login", data);
    return response.data;
  }
  async register(data: RegisterRequestDTO): Promise<BaseResponse<RegisterResponseDTO>> {
    const response = await authenticationServices.post<BaseResponse<RegisterResponseDTO>>("/auth/register", data);
    return response.data;
  }
  async validateToken(token: string): Promise<BaseResponse<{ message: string }>> {
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
  async verifyEmail(verifyEmailToken: string): Promise<BaseResponse<void>> {
    const response = await authenticationServices.get("/auth/verify-email", {
      params: { token: verifyEmailToken },
    });
    return response.data;
  }
  async logout(token: string): Promise<BaseResponse<{ message: string }>> {
    const response = await authenticationServices.get("/auth/logout", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
  async findUser(id: string): Promise<BaseResponse<FindUserResponseDTO>> {
    const response = await authenticationServices.post("/auth/user", {
      "id": id
    });
    return response.data;
  }
  async searchUsers(query: string): Promise<BaseResponse<FindUserResponseDTO[]>> {
    const response = await authenticationServices.get("/auth/search-users", {
      params: { query },
    });
    return response.data;
  }

  async resendVerificationEmail(
    data: ResendVerificationRequestDTO,
  ): Promise<BaseResponse<{ message: string }>> {
    const response = await authenticationServices.post<BaseResponse<{ message: string }>>(
      "/auth/resend-verification",
      data,
    );
    return response.data;
  }

  async updateNotFirstUser(token: string): Promise<BaseResponse<{ message: string }>> {
    const response = await authenticationServices.put<BaseResponse<{ message: string }>>(
      "/auth/not-first-user",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  async findUserByEmail(email: string): Promise<BaseResponse<FindUserResponseDTO>> {
    const response = await authenticationServices.get<BaseResponse<FindUserResponseDTO>>(
      "/auth/find-by-email",
      {
        params: { email },
      }
    );
    return response.data;
  }
}