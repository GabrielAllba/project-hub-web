"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/presentation/components/ui/button"
import { LoadingSpinner } from "@/presentation/components/ui/loading-spinner"
import { useFindUser } from "@/shared/hooks/use-find-user"
import { useResendVerificationEmail } from "@/shared/hooks/use-resend-verification-email"
import { Card, CardContent } from "../components/ui/card"

export function EmailVerificationPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [userId, setUserId] = useState<string | null>(null)
    const [isVerifying, setIsVerifying] = useState(true)
    const [isSending, setIsSending] = useState(false)

    const { triggerFindUser, triggerFindUserResponse } = useFindUser()
    const { triggerResendVerificationEmail } = useResendVerificationEmail()

    useEffect(() => {
        const id = searchParams.get("id")
        setUserId(id)
        if (!id) setIsVerifying(false)
    }, [searchParams])

    useEffect(() => {
        if (!userId) return

        const verifyUser = async () => {
            try {
                const res = await triggerFindUser(userId)

                if (res.status === "success" && res.data) {
                    if (res.data.isEmailVerified) {
                        toast.success("Your email has been verified")
                        navigate("/login")
                    } else {
                        setIsVerifying(false)
                    }
                } else {
                    toast.error("User not fouund")
                    setIsVerifying(false)
                }
            } catch (err) {
                toast.error("An error occured: " + err)
                setIsVerifying(false)
            }
        }

        verifyUser()
    }, [userId])

    const handleResendVerification = async () => {
        if (!triggerFindUserResponse?.data?.email) return

        setIsSending(true)
        try {
            await triggerResendVerificationEmail({
                email: triggerFindUserResponse.data.email,
            })

            toast.success("Verification email successfully sent. If you have not already received the email, try again later!", {
                description: "Please check your email inbox",
            })
        } catch (err) {
            toast.error("Failed to send email", {
                description: (err as Error).message,
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="min-h-svh flex w-full text-zinc-900 dark:text-zinc-100">
            {/* LEFT SIDE - Illustration */}
            <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#a18cd1] via-[#fbc2eb] to-[#8fd3f4]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900" />

                <div className="relative z-10 max-w-xl px-12 text-white">
                    <div className="mb-6 flex gap-3 text-sm font-medium">
                        <span className="bg-white/10 px-4 py-1 rounded-full">Sprint Planning</span>
                        <span className="bg-white/10 px-4 py-1 rounded-full">Backlog Tracking</span>
                        <span className="bg-white/10 px-4 py-1 rounded-full">Charts</span>
                    </div>

                    <div className="rounded-2xl backdrop-blur-xl bg-white/10 p-8 border border-white/20 shadow-2xl">
                        <p className="text-xl font-semibold leading-snug mb-4">
                            Verify your email to start collaborating in your project hub.
                        </p>
                        <p className="text-sm text-white/80">
                            Make sure your email is a valid email to start with project hub.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Content */}
            <div className="flex flex-col items-center w-full lg:w-1/2 justify-center px-6 md:px-10 lg:px-16 py-12 bg-white dark:bg-zinc-950">
                <Card className="rounded-sm max-w-md">
                    <CardContent>
                        <div className="w-full max-w-md space-y-6">
                            <div className="space-y-1 text-left">
                                <h2 className="text-2xl font-bold">Email Verification</h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Verify your email to use project hub.
                                </p>
                            </div>

                            {/* CONDITIONAL CONTENT */}
                            {!userId ? (
                                <div className="text-red-500 text-sm">Invalid verification link.</div>
                            ) : triggerFindUserResponse?.status === "success" ? (
                                isVerifying ? (
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <LoadingSpinner size="sm" />
                                        Verifying your email...
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Email{" "}
                                            <span className="font-semibold underline text-zinc-900 dark:text-zinc-100">
                                                {triggerFindUserResponse.data.email}
                                            </span>{" "}
                                            has not verified yet.
                                        </p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            <span className="text-blue-500">Didn't receive email?</span> Click the button
                                            below to resend email verification.
                                        </p>
                                        <Button
                                            onClick={handleResendVerification}
                                            className="cursor-pointer w-full bg-gradient-to-br from-blue-700 to-blue-800 text-white font-semibold"
                                            disabled={isSending}
                                        >
                                            {isSending ? (
                                                <>
                                                    <LoadingSpinner size="sm" className="mr-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                "Resend Verification Email"
                                            )}
                                        </Button>
                                    </>
                                )
                            ) : (
                                <div className="text-red-500 text-sm">
                                    {triggerFindUserResponse?.message ?? "Terjadi kesalahan"}
                                </div>
                            )}
                        </div>

                        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
                            Already have an account?{" "}
                            <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">
                                Login
                            </Link>{" "}
                            or{" "}
                            <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
                                Register
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
