"use client"

import { RegisterForm } from "@/presentation/components/form/register-form"

export function RegisterPage() {
    return (
        <div className="min-h-svh flex w-full text-zinc-900 dark:text-zinc-100">
            {/* LEFT SIDE - Gradient with Glassmorphism Info */}
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
                            Everything your scrum team needs, in one powerful workspace.
                        </p>
                        <p className="text-sm text-white/80">
                            Plan sprints, manage your backlog, assign tasks, and monitor team progress with clarity.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Register Form */}
            <div className="flex flex-col w-full lg:w-1/2 justify-center px-6 md:px-10 lg:px-16 py-12 bg-white dark:bg-zinc-950">
                <div className="w-full max-w-md mx-auto space-y-6">
                    <div className="space-y-1 text-left">
                        <h2 className="text-3xl  text-blue-700 font-bold">Create your account</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Get started and streamline your scrum workflow.
                        </p>
                    </div>

                    <RegisterForm />

                </div>
            </div>
        </div>
    )
}
