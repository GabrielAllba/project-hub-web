"use client"

import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { useGetProductBacklogById } from "@/shared/hooks/use-get-product-backlog-by-id"
import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "sonner"

interface BacklogContextType {
    backlog: ProductBacklog | null
    isLoading: boolean
    loadBacklog: (backlogId: string) => Promise<void>
    updateBacklog: (partial: Partial<ProductBacklog>) => void
    clearBacklog: () => void
}

const BacklogContext = createContext<BacklogContextType | undefined>(undefined)

export const BacklogProvider = ({ children }: { children: ReactNode }) => {
    const [backlog, setBacklog] = useState<ProductBacklog | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { triggerGetProductBacklogById } = useGetProductBacklogById("")

    const loadBacklog = async (backlogId: string) => {
        setIsLoading(true)
        try {
            const res = await triggerGetProductBacklogById(backlogId)
            if (res.status === "success" && res.data) {
                setBacklog(res.data)
            } else {
                setBacklog(null)
                toast.error("Failed to load backlog", { description: res.message })
            }
        } catch (err) {
            setBacklog(null)
            toast.error("Failed to load backlog: " + err)
        } finally {
            setIsLoading(false)
        }
    }

    const updateBacklog = (partial: Partial<ProductBacklog>) => {
        setBacklog((prev) => (prev ? { ...prev, ...partial } : prev))
    }

    const clearBacklog = () => {
        setBacklog(null)
    }

    return (
        <BacklogContext.Provider
            value={{ backlog, isLoading, loadBacklog, updateBacklog, clearBacklog }}
        >
            {children}
        </BacklogContext.Provider>
    )
}

export const useBacklog = () => {
    const context = useContext(BacklogContext)
    if (!context) throw new Error("useBacklog must be used within a BacklogProvider")
    return context
}
