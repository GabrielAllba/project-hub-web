"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { useCreateProductGoal } from "@/shared/hooks/use-create-product-goal"
import { useDeleteProductGoal } from "@/shared/hooks/use-delete-product-goal"
import { useGetProductGoal } from "@/shared/hooks/use-get-product-goal"
import { useRenameProductGoal } from "@/shared/hooks/use-rename-product-goal"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"


interface ProductGoalWithInfo extends ProductGoal {
    todoTask?: number
    inProgressTask?: number
    doneTask?: number
}


interface ProductGoalsContextType {
    goals: ProductGoalWithInfo[]
    selectedGoalIds: string[]
    setGoals: (goals: ProductGoal[]) => void
    updateGoal: (updated: ProductGoal) => void
    deleteGoal: (goalId: string) => void
    addGoal: (goal: ProductGoal) => void
    createGoal: (title: string) => Promise<void>
    renameGoal: (goalId: string, newTitle: string) => Promise<void>
    deleteGoalByAPI: (goalId: string) => Promise<void>
    refreshGoals: () => Promise<void>
    searchGoals: (query: string) => ProductGoal[]
    loadMoreGoals: () => Promise<void>
    toggleSelectGoal: (goalId: string) => void
    clearSelectedGoals: () => void
    isLoading: boolean
    hasMore: boolean
}

const ProductGoalsContext = createContext<ProductGoalsContextType | undefined>(undefined)

interface ProductGoalsProviderProps {
    children: ReactNode
    projectId: string
}


export function ProductGoalsProvider({ children, projectId }: ProductGoalsProviderProps) {
    const [goals, setGoals] = useState<ProductGoalWithInfo[]>([])
    const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(false)

    const { triggerGetProductGoal } = useGetProductGoal(projectId)
    const { triggerCreateProductGoal } = useCreateProductGoal()
    const { triggerRenameProductGoal } = useRenameProductGoal()
    const { triggerDeleteProductGoal } = useDeleteProductGoal("")

    useEffect(() => {
        if (projectId) {
            refreshGoals()
        }
    }, [projectId])

    const refreshGoals = async () => {
        setIsLoading(true)
        try {
            const res = await triggerGetProductGoal(projectId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
            if (res.status === "success") {
                setGoals(res.data.content)
                setHasMore(!res.data.last)
            }
        } catch (error) {
            toast.error("Failed to refresh goals: " + error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreGoals = async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)
        try {
            const nowPage = Math.floor(goals.length / DEFAULT_PAGE_SIZE)
            const res = await triggerGetProductGoal(projectId, nowPage, DEFAULT_PAGE_SIZE)

            if (res.status === "success") {
                const uniqueNewGoals = res.data.content.filter(
                    (newGoal) => !goals.some((existing) => existing.id === newGoal.id),
                )
                setGoals((prev) => [...prev, ...uniqueNewGoals])
                setHasMore(!res.data.last)
            }
        } catch (error) {
            toast.error("Failed to load more goals: " + error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateGoal = (updated: ProductGoal) => {
        setGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)))
    }

    const deleteGoal = (goalId: string) => {
        setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
        setSelectedGoalIds((prev) => prev.filter((id) => id !== goalId))
    }

    const addGoal = (goal: ProductGoal) => {
        setGoals((prev) => [goal, ...prev])
    }

    const createGoal = async (title: string) => {
        try {
            const res = await triggerCreateProductGoal({ title, projectId })
            if (res.status === "success") {
                addGoal(res.data)
            }
        } catch (error) {
            const baseError = error as BaseResponse<null>
            toast.error("Failed to create goal: " + baseError.message)
        }
    }

    const renameGoal = async (goalId: string, newTitle: string) => {
        try {
            const res = await triggerRenameProductGoal({ productGoalId: goalId, newTitle: newTitle })
            if (res.status === "success") {
                setGoals((prev) => prev.map((goal) => (goal.id === res.data.id ? {...goal, title: res.data.title} : goal)))
            }
            toast.success("Success rename goal")
        } catch (error) {
            const baseError = error as BaseResponse<null>
            toast.error("Failed to rename goal: " + baseError.message)
            throw baseError
        }
    }

    const deleteGoalByAPI = async (goalId: string) => {
        try {
            await triggerDeleteProductGoal(goalId)
            deleteGoal(goalId)
        } catch (error) {
            const baseError = error as BaseResponse<null>
            toast.error("Failed to delete goal: " + baseError.message)
        }
    }

    const toggleSelectGoal = (goalId: string) => {
        setSelectedGoalIds((prev) =>
            prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
        )
    }

    const clearSelectedGoals = () => {
        setSelectedGoalIds([])
    }

    const searchGoals = (query: string) => {
        if (!query.trim()) return goals
        const lowercaseQuery = query.toLowerCase()
        return goals.filter((goal) => goal.title.toLowerCase().includes(lowercaseQuery))
    }

    const value: ProductGoalsContextType = {
        goals,
        selectedGoalIds,
        setGoals,
        updateGoal,
        deleteGoal,
        addGoal,
        createGoal,
        renameGoal,
        deleteGoalByAPI,
        refreshGoals,
        searchGoals,
        loadMoreGoals,
        toggleSelectGoal,
        clearSelectedGoals,
        isLoading,
        hasMore,
    }

    return <ProductGoalsContext.Provider value={value}>{children}</ProductGoalsContext.Provider>
}

export function useProductGoals() {
    const context = useContext(ProductGoalsContext)
    if (context === undefined) {
        throw new Error("useProductGoals must be used within a ProductGoalsProvider")
    }
    return context
}
