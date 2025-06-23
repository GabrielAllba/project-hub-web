"use client"

import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { useProjects } from "@/shared/contexts/project-context"
import { useUser } from "@/shared/contexts/user-context"
import { IconFolderOpen, IconInnerShadowTop, IconRocket } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Drawer, DrawerContent } from "../components/ui/drawer"


const steps: {
    key: string
    title: string
    subtitle: string
    icon: React.ElementType
    description: React.ReactNode | ((params: {
        projectName: string
        setProjectName: React.Dispatch<React.SetStateAction<string>>
    }) => React.ReactNode)
    highlightTagline: string
    highlightDescription: string
    cta: string
}[] = [
        {
            key: "welcome",
            title: "Welcome to Project Hub",
            subtitle: "Your all-in-one solution for managing Scrum projects. Let’s kickstart your journey toward efficient collaboration.",
            icon: IconInnerShadowTop,
            description: (
                <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    In Project Hub, you can plan sprints, track progress, and collaborate efficiently with your team. We'll guide you through setting up your first project.
                </p>
            ),
            highlightTagline: "Everything your Scrum team needs, in one powerful workspace.",
            highlightDescription: "Plan sprints, manage your backlog, assign tasks, and monitor team progress with clarity.",
            cta: "Get Started"
        },
        {
            key: "name_project",
            title: "Name Your First Project",
            subtitle: "Choose a descriptive and memorable name to help you identify it on your dashboard.",
            icon: IconFolderOpen,
            description: ({ projectName, setProjectName }) => (
                <div className="space-y-3 pt-4">
                    <label htmlFor="projectName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        Your Project Name
                    </label>
                    <Input
                        id="projectName"
                        placeholder="e.g., Mobile App Development (iOS & Android)"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">This name will be visible to all team members on this project.</p>
                </div>
            ),
            highlightTagline: "Easily kickstart your projects and set your team up for success.",
            highlightDescription: "Give it the right name and watch your team grow.",
            cta: "Next"
        },
        {
            key: "ready_to_go",
            title: "You're Ready to Go!",
            subtitle: "You're almost done! Confirm your project details below and launch your first project.",
            icon: IconRocket,
            description: ({ projectName }) => (
                <div className="bg-zinc-100 dark:bg-zinc-800 p-5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-inner">
                    <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100 flex items-center">
                        <IconFolderOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        {projectName || "Untitled Project"}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        This project will be created and appear on your dashboard. You can invite team members afterward.
                    </p>
                </div>
            ),
            highlightTagline: "Complete the setup and dive into seamless project management.",
            highlightDescription: "Start now to effectively manage your workflow and collaborate effortlessly.",
            cta: "Create Project"
        }
    ]

export const FirstTimeUserPage = () => {
    const { createProject } = useProjects()
    const { user, markNotFirstTime } = useUser()
    const navigate = useNavigate()

    const [step, setStep] = useState(0)
    const [projectName, setProjectName] = useState("")
    const [loading, setLoading] = useState(false)

    const currentStep = steps[step]

    useEffect(() => {
        if (!user?.isUserFirstTime) {
            navigate('/dashboard')
        }
    }, [user])


    const handleNext = () => {
        if (currentStep.key === "name_project" && !projectName.trim()) {
            toast.error("Project name is required.")
            return
        }
        setStep((prev) => prev + 1)
    }

    const handleBack = () => setStep((prev) => prev - 1)

    const handleCreate = async () => {
        try {
            setLoading(true)

            const newProject = await createProject(projectName)
            if (newProject) {
                toast.success("Project created successfully!")
                await markNotFirstTime()
                navigate(`/dashboard/project/${newProject.projectId}`)
            } else {
                toast.error("Failed to create project.")
            }
        } catch {
            toast.error("An error occurred while creating the project.")
        } finally {
            setLoading(false)
        }
    }


    return (
        <Drawer open={true} direction="left">
            <DrawerContent className="p-0 w-full data-[vaul-drawer-direction=left]:w-4/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-full">
                <div className="min-h-svh flex w-full text-zinc-900 dark:text-zinc-100 font-sans antialiased">
                    <header className="absolute top-0 left-0 right-0 py-6 px-4 sm:px-6 lg:px-8 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-md ">

                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            Step {step + 1} of {steps.length}
                        </div>
                    </header>

                    {/* LEFT SIDE - Highlighted Section (Matches Login Page) */}
                    <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#a18cd1] via-[#fbc2eb] to-[#8fd3f4]">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900" />

                        <div className="relative z-10 max-w-xl px-12 text-white text-center">
                            <div className="mb-6 flex flex-wrap justify-center gap-3 text-sm font-medium">
                                <span className="bg-white/10 px-4 py-1 rounded-full">Sprint Planning</span>
                                <span className="bg-white/10 px-4 py-1 rounded-full">Backlog Tracking</span>
                                <span className="bg-white/10 px-4 py-1 rounded-full">Charts</span>
                            </div>

                            <div className="rounded-2xl backdrop-blur-xl bg-white/10 p-8 border border-white/20 shadow-2xl">
                                <p className="text-xl font-semibold leading-snug mb-4">
                                    {currentStep.highlightTagline}
                                </p>
                                <p className="text-sm text-white/80">
                                    {currentStep.highlightDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - Onboarding Form/Content */}
                    <div className="flex flex-col w-full lg:w-1/2 justify-center px-6 md:px-10 lg:px-16 py-12 bg-white dark:bg-zinc-950">
                        <div className="w-full max-w-md mx-auto space-y-6 pt-16"> {/* Added pt-16 to push content down from fixed header */}
                            {/* Current Step Title and Subtitle */}
                            <div className="space-y-1 text-left animate-fade-in">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <currentStep.icon className="w-8 h-8 mr-3" />
                                    <h2 className="text-3xl font-bold">{currentStep.title}</h2>
                                </div>
                                <p className="text-lg text-zinc-600 dark:text-zinc-300">
                                    {currentStep.subtitle}
                                </p>
                            </div>

                            {/* Main Step Description/Form Input */}
                            <div className="pt-4 animate-fade-in-delay">
                                {typeof currentStep.description === "function"
                                    ? currentStep.description({ projectName, setProjectName })
                                    : currentStep.description}
                            </div>

                            {/* Navigation and Progress Area */}
                            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                {/* Navigation Buttons */}
                                <div className="flex justify-between items-center">
                                    {step > 0 ? (
                                        <Button
                                            variant="ghost"
                                            onClick={handleBack}
                                            className="text-zinc-600 cursor-pointer  transition-colors"
                                        >
                                            Back
                                        </Button>
                                    ) : <div />}
                                    {step < steps.length - 1 ? (
                                        <Button
                                            onClick={handleNext}
                                            className="bg-gradient-to-br cursor-pointer from-blue-700 to-blue-800 text-white px-6 py-3 text-base font-semibold"
                                        >
                                            {currentStep.cta}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleCreate}
                                            disabled={loading}
                                            className="bg-gradient-to-br cursor-pointer from-[#2563EB] to-[#5325eb] text-white  px-6 py-3 text-base font-semibold"
                                        >
                                            {loading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>) : currentStep.cta}
                                        </Button>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 w-full rounded-full overflow-hidden mt-4">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}