"use client"
import { NO_GOAL_ID } from "@/constants/constants"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { useProductGoals } from "@/shared/contexts/product-goals-context"
import { useGetProductGoalById } from "@/shared/hooks/use-get-product-goal-by-id"
import { Bolt, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface ProductGoalModalProps {
  isHoveringItem: boolean
  projectId: string
  onSelectGoal: (goalId: string | null) => void
  selectedGoalId?: string | null
  title?: string
}

export function ProductGoalModal({
  isHoveringItem,
  onSelectGoal,
  selectedGoalId = null,
  title = "Add product goal",

}: ProductGoalModalProps) {
  const { goals, loadMoreGoals, isLoading, hasMore } = useProductGoals()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGoals, setFilteredGoals] = useState<ProductGoal[]>([])
  const [fetchedGoal, setFetchedGoal] = useState<ProductGoal | null>(null)
  const [isSearchingRemote, setIsSearchingRemote] = useState(false)
  const [selectedProductGoal, setSelectedProductGoal] = useState<ProductGoal | null>(null)

  const { triggerGetProductGoalById } = useGetProductGoalById("")

  // Ensure selected goal is shown even if not in goals list
  useEffect(() => {
    if (!selectedGoalId) {
      setSelectedProductGoal(null)
      return
    }

    const local = goals.find((goal) => goal.id === selectedGoalId)
    if (local) {
      setSelectedProductGoal(local)
    } else {
      triggerGetProductGoalById(selectedGoalId).then((res) => {
        if (res.status === "success" && res.data) {
          setSelectedProductGoal(res.data)
        } else {
          setSelectedProductGoal(null)
          onSelectGoal(NO_GOAL_ID)
        }
      })
    }
  }, [selectedGoalId, goals])

  // Handle search and fetch if not found
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim()

    if (query === "") {
      setFilteredGoals(goals)
      setFetchedGoal(null)
    } else {
      const localFiltered = goals.filter((goal) =>
        goal.title.toLowerCase().includes(query)
      )

      setFilteredGoals(localFiltered)

      if (localFiltered.length === 0 && query.length > 5) {
        setIsSearchingRemote(true)
        triggerGetProductGoalById(query).then((res) => {
          if (res.status === "success" && res.data) {
            setFetchedGoal(res.data)
          } else {
            setFetchedGoal(null)
          }
          setIsSearchingRemote(false)
        })
      } else {
        setFetchedGoal(null)
        setIsSearchingRemote(false)
      }
    }
  }, [searchQuery, goals])

  const renderTrigger = () => {
    if (selectedProductGoal) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-sm text-xs text-purple-600 bg-purple-100 border-purple-500 px-2 py-0.5 cursor-pointer hover:bg-purple-50"
              >
                <Bolt className="h-4 w-4 text-purple-500" />
                <p className="max-w-[96px] truncate font-semibold">
                  {selectedProductGoal.title}
                </p>
              </Badge>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{selectedProductGoal.title}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      isHoveringItem && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex items-center gap-1"
          >
            Goal
          </Button>
        </DialogTrigger>
      )
    )
  }

  return (
    <Dialog>
      {renderTrigger()}

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
              className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedGoalId === null
                ? "bg-blue-50 border border-blue-200"
                : "hover:bg-gray-50"
                }`}
              onClick={() => onSelectGoal(null)}
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
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedGoalId === goal.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => onSelectGoal(goal.id)}
                >
                  <Bolt className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm">{goal.title}</span>
                </div>
              ))}

              {filteredGoals.length === 0 && fetchedGoal && (
                <div
                  key={fetchedGoal.id}
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedGoalId === fetchedGoal.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => onSelectGoal(fetchedGoal.id)}
                >
                  <Bolt className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm">{fetchedGoal.title}</span>
                </div>
              )}

              {isSearchingRemote && (
                <div className="text-center py-4 text-gray-500">Searching...</div>
              )}

              {filteredGoals.length === 0 &&
                !fetchedGoal &&
                !isSearchingRemote &&
                !isLoading && (
                  <div className="text-center py-4 text-gray-500">
                    {searchQuery
                      ? "No matching product goals found"
                      : "No product goals available"}
                  </div>
                )}

              {hasMore && (
                <Button
                  variant="ghost"
                  className="w-full text-sm mt-2"
                  onClick={loadMoreGoals}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load more"}
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
