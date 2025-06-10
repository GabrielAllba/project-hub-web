"use client";

import type { ProductGoal } from "@/domain/entities/product-goal";
import { useDeleteProductGoal } from "@/shared/hooks/use-delete-product-goal";
import { useRenameProductGoal } from "@/shared/hooks/use-rename-product-goal";
import { cn } from "@/shared/utils/merge-class";
import { CheckSquare, Pencil, Square, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

interface ProductGoalItemProps {
    goal: ProductGoal;
    isSelected: boolean;
    onToggleSelect: () => void;
    onUpdated: (updated: ProductGoal) => void;
    onDeleted: (goalId: string) => void;
}

export default function ProductGoalItem({
    goal,
    isSelected,
    onToggleSelect,
    onUpdated,
    onDeleted,
}: ProductGoalItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingTitle, setEditingTitle] = useState(goal.title);

    const { triggerRenameProductGoal } = useRenameProductGoal();
    const { triggerDeleteProductGoal } = useDeleteProductGoal("");

    const handleRename = async () => {
        if (!editingTitle.trim()) return;
        const newTitle = editingTitle.trim();
        await triggerRenameProductGoal({ productGoalId: goal.id, newTitle });
        onUpdated({ ...goal, title: newTitle });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await triggerDeleteProductGoal(goal.id);
        onDeleted(goal.id);
    };

    return (
        <div
            className={cn(
                "group relative rounded-md bg-white flex flex-col gap-1 cursor-pointer transition border",
                isSelected && "bg-blue-100 border-blue-400"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="w-full flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 w-full px-3 py-2"
                        onClick={onToggleSelect}
                    >
                        {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                            <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                        {isEditing ? (
                            <Input
                                className="text-sm h-6"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename();
                                }}
                                autoFocus
                            />
                        ) : (
                            <span
                                className={cn("text-sm truncate max-w-[140px]", isSelected && "text-blue-600")}
                            >
                                {goal.title}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1 p-2">
                        <Pencil
                            className="w-4 h-4 text-muted-foreground cursor-pointer"
                            onClick={() => setIsEditing(true)}
                        />
                        <Trash2
                            className="w-4 h-4 text-muted-foreground cursor-pointer"
                            onClick={handleDelete}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
