import type { LoginRequestDTO } from "@/domain/dto/req/login-req";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useLogin } from "@/shared/hooks/use-login";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { triggerLogin, triggerLoginLoading } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: LoginRequestDTO = { email, password };
    const response = await triggerLogin(payload);

    if (response.status === 200) {
      localStorage.setItem("accessToken", response.data.accessToken);
      toast.success("Login successful", {
        description: "Welcome back!",
      });
      navigate("/dashboard"); 
    } else {
      setErrorMessage(response.message || "Login failed");
      toast.error("Login failed", {
        description: response.message,
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {errorMessage && (
                <div className="text-sm text-red-500">{errorMessage}</div>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={triggerLoginLoading}>
                  {triggerLoginLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Register
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
