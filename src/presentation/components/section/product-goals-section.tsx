"use client"
import { NO_GOAL_ID } from "@/constants/constants"
import type { ProductGoal } from "@/domain/entities/product-goal"
import { useProductGoals } from "@/shared/contexts/product-goals-context"
import { useCreateProductGoal } from "@/shared/hooks/use-create-product-goal"
import { cn } from "@/shared/utils/merge-class"
import { Flag, X } from "lucide-react"
import { useState } from "react"
import ProductGoalItem from "../items/product-goal-item"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"

interface ProductGoalsSectionProps {
    projectId: string
}

export default function ProductGoalsSection({ projectId }: ProductGoalsSectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newGoalTitle, setNewGoalTitle] = useState("")

    const { goals, selectedGoalIds, toggleSelectGoal, updateGoal, deleteGoal, loadMoreGoals, hasMore, setGoals } =
        useProductGoals()
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

    const isNoGoalSelected = selectedGoalIds.has(NO_GOAL_ID)

    return (
        <Card className="w-full rounded-sm border bg-gray-50 p-3 shadow-none">
            <div className="flex items-center justify-between mb-0">
                <h4 className="text-sm font-semibold">Product Goal</h4>
                <X className="w-4 h-4 text-muted-foreground cursor-pointer" />
            </div>

            <ScrollArea className="h-[300px] pr-1.5">
                <div className="space-y-1.5">
                    <div
                        className={cn(
                            "bg-white w-full px-3 py-2 rounded-md border text-sm flex items-center gap-2 cursor-pointer",
                            isNoGoalSelected && "bg-blue-100 border border-blue-400",
                        )}
                        onClick={() => toggleSelectGoal(NO_GOAL_ID)}
                    >
                        <Flag className={cn("w-4 h-4 text-muted-foreground", isNoGoalSelected && "text-blue-600")} />
                        <span className={isNoGoalSelected ? "text-blue-600" : ""}>No product goal</span>
                    </div>

                    {goals.map((goal) => (
                        <ProductGoalItem
                            key={goal.id}
                            goal={goal}
                            isSelected={selectedGoalIds.has(goal.id)}
                            onToggleSelect={() => toggleSelectGoal(goal.id)}
                            onUpdated={handleUpdateGoal}
                            onDeleted={handleDeleteGoal}
                        />
                    ))}
                </div>
            </ScrollArea>

            {hasMore && (
                <div className="flex justify-center mt-2">
                    <Button variant="outline" size="sm" onClick={loadMoreGoals}>
                        Load More
                    </Button>
                </div>
            )}

            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-sm text-blue-600 hover:underline hover:cursor-pointer mt-2"
                >
                    + Create product goal
                </button>
            ) : (
                <div className="mt-2">
                    <Input
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="Product goal title"
                        className="text-sm rounded-sm"
                        autoFocus
                        onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                                await handleAddGoal()
                            } else if (e.key === "Escape") {
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
