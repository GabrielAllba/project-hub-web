import { ValidateTokenUseCase } from "@/application/usecases/validate-token-usecase";
import { AuthenticationServiceRepository } from "@/infrastructure/repositories/authentication-service-repository";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

const validateTokenUseCase = new ValidateTokenUseCase(new AuthenticationServiceRepository());

const fetcher = async (token: string) => {
  return await validateTokenUseCase.execute(token);
};

export function useAuthGuard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const { error, isLoading } = useSWR(
    token ? "/auth/validate-token" : null,
    () => fetcher(token!)
  );

  useEffect(() => {
    if (error || !token) {
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    }
  }, [error, navigate, token]);

  return { validating: isLoading };
}