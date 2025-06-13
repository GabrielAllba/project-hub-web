"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { useGetProductGoal } from "@/shared/hooks/use-get-product-goal"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface ProductGoalsContextType {
    goals: ProductGoal[]
    selectedGoalIds: Set<string>
    setGoals: (goals: ProductGoal[]) => void
    updateGoal: (updated: ProductGoal) => void
    deleteGoal: (goalId: string) => void
    addGoal: (goal: ProductGoal) => void
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
    const [goals, setGoals] = useState<ProductGoal[]>([])
    const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const { triggerGetProductGoal } = useGetProductGoal(projectId)

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
            console.error("Failed to refresh goals:", error)
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
            console.error("Failed to load more goals:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateGoal = (updated: ProductGoal) => {
        setGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)))
    }

    const deleteGoal = (goalId: string) => {
        setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
        // Remove from selected goals if it was selected
        setSelectedGoalIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(goalId)
            return newSet
        })
    }

    const addGoal = (goal: ProductGoal) => {
        setGoals((prev) => [goal, ...prev])
    }

    const toggleSelectGoal = (goalId: string) => {
        setSelectedGoalIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(goalId)) {
                newSet.delete(goalId)
            } else {
                newSet.add(goalId)
            }
            return newSet
        })
    }

    const clearSelectedGoals = () => {
        setSelectedGoalIds(new Set())
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
