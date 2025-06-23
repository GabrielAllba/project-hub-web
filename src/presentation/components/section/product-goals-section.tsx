"use client"
import { NO_GOAL_ID } from "@/constants/constants"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { useBacklog } from "@/shared/contexts/backlog-context"
import { useProductGoals } from "@/shared/contexts/product-goals-context"
import { useCreateProductGoal } from "@/shared/hooks/use-create-product-goal"
import { cn } from "@/shared/utils/merge-class"
import { Flag, X } from "lucide-react"
import { useEffect, useState } from "react"
import ProductGoalItem from "../items/product-goal-item"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { useSprint } from "@/shared/contexts/sprint-context"

interface ProductGoalsSectionProps {
    projectId: string
}

export default function ProductGoalsSection({ projectId }: ProductGoalsSectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newGoalTitle, setNewGoalTitle] = useState("")

    const {
        setProductGoalIds: setProductGoalIdsSprintBacklog
    } = useSprint()

    const {
        setProductGoalIds
    } = useBacklog()

    const {
        goals,
        selectedGoalIds,
        toggleSelectGoal,
        updateGoal,
        deleteGoal,
        loadMoreGoals,
        hasMore,
        setGoals
    } = useProductGoals()

    useEffect(() => {
        setProductGoalIds(selectedGoalIds)
        setProductGoalIdsSprintBacklog(selectedGoalIds)
    }, [selectedGoalIds])


    const { triggerCreateProductGoal } = useCreateProductGoal()

    const handleAddGoal = async () => {
        if (!newGoalTitle.trim()) return
        const response = await triggerCreateProductGoal({ projectId, title: newGoalTitle.trim() })
        if (response.status === "success") {
            const newGoal = response.data
            setGoals([newGoal, ...goals])
        }
        setNewGoalTitle("")
        setIsAdding(false)
    }

    const handleUpdateGoal = (updated: ProductGoal) => {
        updateGoal(updated)
    }

    const handleDeleteGoal = (goalId: string) => {
        deleteGoal(goalId)
    }

    const isNoGoalSelected = selectedGoalIds.includes(NO_GOAL_ID)

    return (
        <Card className="w-full rounded-lg border border-zinc-200 bg-gray-50 p-4 shadow-none">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-zinc-800">🎯 Product Goals</h4>
                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors" />
            </div>

            <ScrollArea className="h-[300px] pr-1.5">
                <div className="space-y-2">
                    {/* No Goal Item */}
                    <div
                        onClick={() => toggleSelectGoal(NO_GOAL_ID)}
                        className={cn(
                            "w-full px-3 py-2 rounded-md border flex items-center gap-2 text-sm cursor-pointer transition-colors",
                            isNoGoalSelected
                                ? "bg-blue-50 border-blue-400 text-blue-700"
                                : "bg-white border-zinc-200 hover:bg-zinc-50"
                        )}
                    >
                        <Flag
                            className={cn(
                                "w-4 h-4",
                                isNoGoalSelected ? "text-blue-600" : "text-zinc-400"
                            )}
                        />
                        <span>{isNoGoalSelected ? "No product goal (selected)" : "No product goal"}</span>
                    </div>

                    {/* All Goal Items */}
                    {goals.map((goal) => (
                        <ProductGoalItem
                            key={goal.id}
                            goal={goal}
                            isSelected={selectedGoalIds.includes(goal.id)}
                            onToggleSelect={() => toggleSelectGoal(goal.id)}
                            onUpdated={handleUpdateGoal}
                            onDeleted={handleDeleteGoal}
                        />
                    ))}
                </div>
            </ScrollArea>

            {/* Load more */}
            {hasMore && (
                <div className="flex justify-center mt-4">
                    <Button variant="outline" size="sm" className="rounded-full border-zinc-300 text-zinc-600 hover:bg-zinc-50" onClick={loadMoreGoals}>
                        Load More
                    </Button>
                </div>
            )}

            {/* Add new goal input */}
            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-sm text-blue-600 hover:underline hover:cursor-pointer mt-4"
                >
                    + Create product goal
                </button>
            ) : (
                <div className="mt-4">
                    <Input
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="New product goal title"
                        className="text-sm rounded-md border-zinc-300 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        onKeyDown={async (e) => {
                            if (e.key === "Enter") await handleAddGoal()
                            else if (e.key === "Escape") {
                                setIsAdding(false)
                                setNewGoalTitle("")
                            }
                        }}
                    />
                </div>
            )}
        </Card>

    )
}
