"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { useGetProductGoal } from "@/shared/hooks/use-get-product-goal"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface ProductGoalsContextType {
    productGoals: ProductGoal[]
    isLoading: boolean
    hasMore: boolean
    searchQuery: string
    filteredGoals: ProductGoal[]
    setSearchQuery: (query: string) => void
    loadMoreGoals: () => Promise<void>
    refreshGoals: () => Promise<void>
    updateGoal: (goalId: string, updates: Partial<ProductGoal>) => void
    removeGoal: (goalId: string) => void
    addGoal: (goal: ProductGoal) => void
}

const ProductGoalsContext = createContext<ProductGoalsContextType | undefined>(undefined)

interface ProductGoalsProviderProps {
    children: ReactNode
    projectId: string
}

export function ProductGoalsProvider({ children, projectId }: ProductGoalsProviderProps) {
    const [productGoals, setProductGoals] = useState<ProductGoal[]>([])
    const [page, setPage] = useState(DEFAULT_PAGE)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredGoals, setFilteredGoals] = useState<ProductGoal[]>([])

    const { triggerGetProductGoal } = useGetProductGoal(projectId)

    // Filter goals when search query changes
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredGoals(productGoals)
        } else {
            const query = searchQuery.toLowerCase()
            setFilteredGoals(productGoals.filter((goal) => goal.title.toLowerCase().includes(query)))
        }
    }, [searchQuery, productGoals])

    const loadGoals = async (resetPage = false) => {
        if (isLoading || (!hasMore && !resetPage)) return

        try {
            setIsLoading(true)
            const currentPage = resetPage ? DEFAULT_PAGE : page
            const response = await triggerGetProductGoal(projectId, currentPage, DEFAULT_PAGE_SIZE)

            if (response.status === "success") {
                setProductGoals((prev) => {
                    if (resetPage) {
                        return response.data.content
                    }

                    const newGoals = [...prev]
                    // Add only unique goals
                    response.data.content.forEach((goal) => {
                        if (!newGoals.some((g) => g.id === goal.id)) {
                            newGoals.push(goal)
                        }
                    })
                    return newGoals
                })

                setHasMore(!response.data.last)
                setPage(resetPage ? DEFAULT_PAGE + 1 : page + 1)
            }
        } catch (error) {
            console.error("Failed to load product goals:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreGoals = () => loadGoals(false)
    const refreshGoals = () => {
        setPage(DEFAULT_PAGE)
        setHasMore(true)
        return loadGoals(true)
    }

    const updateGoal = (goalId: string, updates: Partial<ProductGoal>) => {
        setProductGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)))
    }

    const removeGoal = (goalId: string) => {
        setProductGoals((prev) => prev.filter((goal) => goal.id !== goalId))
    }

    const addGoal = (goal: ProductGoal) => {
        setProductGoals((prev) => [goal, ...prev])
    }

    // Load initial goals
    useEffect(() => {
        if (projectId && productGoals.length === 0) {
            loadGoals(true)
        }
    }, [projectId])

    const value: ProductGoalsContextType = {
        productGoals,
        isLoading,
        hasMore,
        searchQuery,
        filteredGoals,
        setSearchQuery,
        loadMoreGoals,
        refreshGoals,
        updateGoal,
        removeGoal,
        addGoal,
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
