import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/presentation/components/login/login-form";

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard", { replace: true }); 
    }
  }, [navigate]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
