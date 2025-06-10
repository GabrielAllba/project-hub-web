"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { useGetProductGoal } from "@/shared/hooks/use-get-product-goal"
import { Bolt, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"

interface ProductGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onSelectGoal: (goalId: string | null) => void
  selectedGoalId?: string | null
  title?: string
}

export function ProductGoalModal({
  open,
  onOpenChange,
  projectId,
  onSelectGoal,
  selectedGoalId = null,
  title = "Add product goal",
}: ProductGoalModalProps) {
  const [productGoals, setProductGoals] = useState<ProductGoal[]>([])
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGoals, setFilteredGoals] = useState<ProductGoal[]>([])

  const { triggerGetProductGoal } = useGetProductGoal(projectId)

  // Load initial goals
  useEffect(() => {
    if (open && productGoals.length === 0) {
      loadGoals()
    }
  }, [open])

  // Filter goals when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGoals(productGoals)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredGoals(productGoals.filter((goal) => goal.title.toLowerCase().includes(query)))
    }
  }, [searchQuery, productGoals])

  const loadGoals = async () => {
    if (isLoading || !hasMore) return

    try {
      setIsLoading(true)
      const response = await triggerGetProductGoal(projectId, page, DEFAULT_PAGE_SIZE)

      if (response.status === "success") {
        setProductGoals((prev) => {
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
        setPage((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Failed to load product goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectGoal = (goalId: string | null) => {
    onSelectGoal(goalId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-4">
            Select a product goal. Backlog items can only belong to one product goal at a time.
          </p>

          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search product goals..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mb-2">
            <div
              className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
                selectedGoalId === null ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelectGoal(null)}
            >
              <Bolt className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm">No product goal</span>
            </div>
          </div>

          <ScrollArea className="h-[300px] overflow-y-auto pr-3">
            <div className="space-y-1">
              {filteredGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
                    selectedGoalId === goal.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectGoal(goal.id)}
                >
                  <Bolt className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm">{goal.title}</span>
                </div>
              ))}

              {hasMore && (
                <Button variant="ghost" className="w-full text-sm mt-2" onClick={loadGoals} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Load more"}
                </Button>
              )}

              {filteredGoals.length === 0 && !isLoading && (
                <div className="text-center py-4 text-gray-500">
                  {searchQuery ? "No matching product goals found" : "No product goals available"}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
