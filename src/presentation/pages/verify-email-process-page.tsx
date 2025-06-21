"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import type { BaseResponse } from "@/domain/dto/base-response"
import { LoadingSpinner } from "@/presentation/components/ui/loading-spinner"
import { useVerifyEmail } from "@/shared/hooks/use-verify-email"
import { Card, CardContent } from "@/presentation/components/ui/card"
import { Button } from "@/presentation/components/ui/button"
import { Link } from "react-router-dom"

export const VerifyEmailProcessPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [verifyEmailToken, setVerifyEmailToken] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(true)
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

    const { triggerVerifyEmail } = useVerifyEmail()

    useEffect(() => {
        const token = searchParams.get("verifyEmailToken")
        if (!token) {
            toast.error("Invalid verification link")
            navigate("/login")
        } else {
            setVerifyEmailToken(token)
        }
    }, [searchParams])

    useEffect(() => {
        const runVerification = async () => {
            if (!verifyEmailToken) return

            try {
                const res = await triggerVerifyEmail(verifyEmailToken)
                if (res.status === "success") {
                    toast.success("Email successfully verified!")
                    setIsSuccess(true)
                    setTimeout(() => {
                        navigate("/login")
                    }, 3000)
                } else {
                    toast.error("Verification failed", {
                        description: res.message,
                    })
                    setIsSuccess(false)
                }
            } catch (err) {
                const baseError = err as BaseResponse<null>
                toast.error("Verification failed", {
                    description: baseError?.message || "Unknown error",
                })
                setIsSuccess(false)
            } finally {
                setIsProcessing(false)
            }
        }

        runVerification()
    }, [verifyEmailToken])

    return (
        <div className="min-h-svh flex w-full text-zinc-900 dark:text-zinc-100">
            {/* LEFT SIDE - Illustration */}
            <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#a18cd1] via-[#fbc2eb] to-[#8fd3f4]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#5325eb]" />
                <div className="relative z-10 max-w-xl px-12 text-white">
                    <div className="mb-6 flex gap-3 text-sm font-medium">
                        <span className="bg-white/10 px-4 py-1 rounded-full">Security</span>
                        <span className="bg-white/10 px-4 py-1 rounded-full">Authentication</span>
                        <span className="bg-white/10 px-4 py-1 rounded-full">Email Verification</span>
                    </div>
                    <div className="rounded-2xl backdrop-blur-xl bg-white/10 p-8 border border-white/20 shadow-2xl">
                        <p className="text-xl font-semibold leading-snug mb-4">
                            Verifying your email for secure access.
                        </p>
                        <p className="text-sm text-white/80">
                            Secure your account by verifying your email. This helps us confirm your identity and protect your data.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Content */}
            <div className="flex flex-col items-center w-full lg:w-1/2 justify-center px-6 md:px-10 lg:px-16 py-12 bg-white dark:bg-zinc-950">
                <Card className="rounded-sm w-full max-w-md">
                    <CardContent className="p-6 space-y-6 text-center">
                        <h2 className="text-2xl font-bold">Email Verification</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            We are verifying your email address...
                        </p>

                        {isProcessing && (
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <LoadingSpinner size="lg" className="mx-auto" />
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">Please wait a moment...</p>
                            </div>
                        )}

                        {!isProcessing && isSuccess === true && (
                            <div className="space-y-4">
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    Your email has been successfully verified!
                                </p>
                                <Button
                                    className="w-full bg-gradient-to-br from-[#2563EB] to-[#5325eb] text-white"
                                    onClick={() => navigate("/login")}
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}

                        {!isProcessing && isSuccess === false && (
                            <div className="space-y-4">
                                <p className="text-red-500 dark:text-red-400 font-medium">
                                    Failed to verify email.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate("/register")}
                                >
                                    Register Again
                                </Button>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-[#2563EB] dark:text-blue-400 font-semibold hover:underline">
                                        Login
                                    </Link>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
