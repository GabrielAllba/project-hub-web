"use client"

import type React from "react"

import type { CreateProductBacklogRequestDTO } from "@/domain/dto/req/create-product-backlog-req"
import { useCreateProductBacklog } from "@/shared/hooks/use-create-product-backlog"
import { useEffect, useRef, useState } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { LoadingSpinner } from "../../ui/loading-spinner"

interface AddProductBacklogInputProps {
    projectId: string
    onTaskCreated: () => void
}

export const AddTaskInput = ({ projectId, onTaskCreated }: AddProductBacklogInputProps) => {
    const [isInputVisible, setIsInputVisible] = useState(false)
    const [taskTitle, setTaskTitle] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const { triggerCreateProductBacklog, triggerCreateProductBacklogLoading } = useCreateProductBacklog()

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

        try {
            const createDto: CreateProductBacklogRequestDTO = {
                title: taskTitle.trim(),
            }

            const response = await triggerCreateProductBacklog(createDto, projectId)

            if (response.status === "success") {
                handleHideInput()
                onTaskCreated()
            } else {
                console.error("Failed to create task:", response.message)
            }
        } catch (error) {
            console.error("Error creating task:", error)
        }
    }

    const handleBlur = () => {
        if (!triggerCreateProductBacklogLoading && !taskTitle.trim()) {
            handleHideInput()
        }
    }

    if (isInputVisible) {
        return (
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Input
                        ref={inputRef}
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleBlur}
                        placeholder="Enter task title and press Enter"
                        disabled={triggerCreateProductBacklogLoading}
                        className="pr-8"
                    />
                    {triggerCreateProductBacklogLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <LoadingSpinner size="sm" />
                        </div>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleHideInput} disabled={triggerCreateProductBacklogLoading}>
                    Cancel
                </Button>
            </div>
        )
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleShowInput}>
            + Tambah tugas
        </Button>
    )
}
