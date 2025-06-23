"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { useBacklog } from "@/shared/contexts/backlog-context"
import { useSprint } from "@/shared/contexts/sprint-context"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { LoadingSpinner } from "../ui/loading-spinner"

interface Props {
    sprintId?: string
}

export const AddProductBacklogInput = (props: Props) => {
    const { createUnassignedBacklog } = useBacklog()
    const { createSprintBacklog } = useSprint()

    const [isInputVisible, setIsInputVisible] = useState(false)
    const [taskTitle, setTaskTitle] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isInputVisible && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isInputVisible])

    const handleShowInput = () => {
        setIsInputVisible(true)
    }

    const handleHideInput = () => {
        setIsInputVisible(false)
        setTaskTitle("")
    }

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && taskTitle.trim()) {
            await handleCreateTask()
        } else if (e.key === "Escape") {
            handleHideInput()
        }
    }

    const handleCreateTask = async () => {
        if (!taskTitle.trim()) return
        setIsLoading(true)

        if (props.sprintId) {
            try {
                const response = await createSprintBacklog({ sprintId: props.sprintId!, title: taskTitle.trim() })
                if (response.status === "success") {
                    setTaskTitle("")
                    setIsInputVisible(false)
                } else {
                    toast.error("Failed to create task: " + response.message)
                }
            } catch (error) {
                toast.error("Error creating task: " + error)
            } finally {
                setIsLoading(false)
            }
        } else {
            try {
                const response = await createUnassignedBacklog(taskTitle.trim())
                if (response.status === "success") {
                    setTaskTitle("")
                    setIsInputVisible(false)
                } else {
                    toast.error("Failed to create task: " + response.message)
                }
            } catch (error) {
                toast.error("Error creating task: " + error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleBlur = () => {
        if (!isLoading && !taskTitle.trim()) {
            handleHideInput()
        }
    }

    if (isInputVisible) {
        return (
            <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                    <Input
                        ref={inputRef}
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleBlur}
                        placeholder="Enter task title and press Enter"
                        disabled={isLoading}
                        className="pr-8"
                    />
                    {isLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <LoadingSpinner size="sm" />
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHideInput}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        )
    }

    return (
        <Button
            className="hover:cursor-pointer mt-2"
            variant="ghost"
            size="sm"
            onClick={handleShowInput}
        >
            + Add Task
        </Button>
    )
}
