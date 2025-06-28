"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import type { BaseResponse } from "@/domain/dto/base-response"
import type { LoginRequestDTO } from "@/domain/dto/req/login-req"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { LoadingSpinner } from "@/presentation/components/ui/loading-spinner"
import { useLogin } from "@/shared/hooks/use-login"
import { useSearchUsers } from "@/shared/hooks/use-search-users"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

export function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const { triggerSearchUsers } = useSearchUsers()
  const { triggerLogin, triggerLoginLoading } = useLogin()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const payload: LoginRequestDTO = { identifier, password }
      const response = await triggerLogin(payload)

      if (response.status === "success" && response.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken)

        toast.success("Login Successful", {
          description: response.message,
        })
        navigate("/dashboard")
      }
    } catch (err) {
      const baseError = err as BaseResponse<null>

      if (baseError.message === "Email not verified yet") {
        try {
          const res = await triggerSearchUsers(identifier)
          if (res.status === "success" && res.data.length > 0) {
            navigate(`/verify-email?id=${res.data[0].id}`)
            return
          }
        } catch {
          toast.error("User tidak ditemukan saat verifikasi")
        }
      }

      setErrorMessage(baseError.message)
      toast.error("Gagal login", {
        description: baseError.message,
      })
    }
  }

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email or username and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label
              htmlFor="identifier"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email / Username
            </Label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter email or username"
              className="rounded-lg py-2 px-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="grid gap-2 relative">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="rounded-lg py-2 px-3 pr-10 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500">{errorMessage}</div>
          )}

          <Button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-br from-blue-700 to-blue-800 text-white font-semibold transition-colors duration-200"
            disabled={triggerLoginLoading}
          >
            {triggerLoginLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
