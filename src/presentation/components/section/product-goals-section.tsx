"use client";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants";
import type { ProductGoal } from "@/domain/entities/product-goal";
import { useCreateProductGoal } from "@/shared/hooks/use-create-product-goal";
import { useGetProductGoal } from "@/shared/hooks/use-get-product-goal";
import { cn } from "@/shared/utils/merge-class";
import { Flag, X } from "lucide-react";
import { useEffect, useState } from "react";
import ProductGoalItem from "../items/product-goal-item";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

const NO_GOAL_ID = "no-goal";

interface ProductGoalsSectionProps {
    projectId: string;
}

export default function ProductGoalsSection({ projectId }: ProductGoalsSectionProps) {
    const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set());
    const [isAdding, setIsAdding] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [goals, setGoals] = useState<ProductGoal[]>([]);

    const {
        triggerGetProductGoal,
        triggerGetProductGoalResponse,
    } = useGetProductGoal(projectId);

    const { triggerCreateProductGoal } = useCreateProductGoal();

    useEffect(() => {
        triggerGetProductGoal(projectId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE).then((res) => {
            setGoals(res.data.content);
        });
    }, [projectId]);

    const toggleSelectGoal = (goalId: string) => {
        setSelectedGoalIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(goalId)) {
                newSet.delete(goalId);
            } else {
                newSet.add(goalId);
            }
            return newSet;
        });
    };

    const handleAddGoal = async () => {
        if (!newGoalTitle.trim()) return;
        await triggerCreateProductGoal({ projectId, title: newGoalTitle.trim() });
        setNewGoalTitle("");
        const res = await triggerGetProductGoal(projectId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
        setGoals(res.data.content);
    };

    const handleUpdateGoal = (updated: ProductGoal) => {
        setGoals((prev) =>
            prev.map((goal) => (goal.id === updated.id ? updated : goal))
        );
    };

    const handleDeleteGoal = (goalId: string) => {
        setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    };

    const isNoGoalSelected = selectedGoalIds.has(NO_GOAL_ID);

    const handleLoadMore = async () => {
        const nowPage = Math.floor(goals.length / DEFAULT_PAGE_SIZE);
        const res = await triggerGetProductGoal(projectId, nowPage, DEFAULT_PAGE_SIZE);
        if (res.status === "success") {
            const uniqueNewGoals = res.data.content.filter(
                (newGoal) => !goals.some((existing) => existing.id === newGoal.id)
            );
            setGoals((prev) => [...prev, ...uniqueNewGoals]);
        }
    };

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
                            isNoGoalSelected && "bg-blue-100 border border-blue-400"
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

            {!triggerGetProductGoalResponse?.data.last && (
                <div className="flex justify-center mt-2">
                    <Button variant="outline" size="sm" onClick={handleLoadMore}>
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
                                await handleAddGoal();
                            } else if (e.key === "Escape") {
                                setIsAdding(false);
                                setNewGoalTitle("");
                            }
                        }}
                    />
                </div>
            )}

        </Card>
    );
}
