"use client"
import { NO_GOAL_ID } from "@/constants/constants"
import { useBacklog } from "@/shared/contexts/backlog-context"
import { useProductGoals } from "@/shared/contexts/product-goals-context"
import { useSprint } from "@/shared/contexts/sprint-context"
import { cn } from "@/shared/utils/merge-class"
import { IconTargetArrow } from "@tabler/icons-react"
import { Flag } from "lucide-react"
import { useEffect, useState } from "react"
import ProductGoalItem from "../items/product-goal-item"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"


export default function ProductGoalsSection() {
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
        loadMoreGoals,
        hasMore,
        createGoal
    } = useProductGoals()

    useEffect(() => {
        setProductGoalIds(selectedGoalIds)
        setProductGoalIdsSprintBacklog(selectedGoalIds)
    }, [selectedGoalIds])



    const handleAddGoal = async () => {
        if (!newGoalTitle.trim()) return
        await createGoal(newGoalTitle.trim())
        setNewGoalTitle("")
        setIsAdding(false)
    }

   

    const isNoGoalSelected = selectedGoalIds.includes(NO_GOAL_ID)

    return (
        <Card className="w-full rounded-lg border border-zinc-200 bg-gray-50 p-4 shadow-none">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-zinc-800">
                    <div className="flex gap-2 items-center">
                        <IconTargetArrow size={16} className="text-red-600" />
                        <span>
                            Product Goals
                        </span>
                    </div>
                </h4>
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
