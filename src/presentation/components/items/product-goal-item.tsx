"use client"

import type { ProductGoal } from "@/domain/entities/product-goal"
import { useProductGoals } from "@/shared/contexts/product-goals-context"
import { cn } from "@/shared/utils/merge-class"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { CheckSquare, MoreHorizontal, Square } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface ProductGoalItemProps {
  goal: ProductGoal & {
    todoTask?: number
    inProgressTask?: number
    doneTask?: number
  }
  isSelected: boolean
  onToggleSelect: () => void
}

export default function ProductGoalItem({
  goal,
  isSelected,
  onToggleSelect,
}: ProductGoalItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(goal.title)

  const { renameGoal, deleteGoalByAPI } = useProductGoals()

  const handleRename = async () => {
    const trimmed = editingTitle.trim()
    if (!trimmed || trimmed === goal.title) {
      setIsEditing(false)
      setEditingTitle(goal.title)
      return
    }

    setIsEditing(false)
    try {
      await renameGoal(goal.id, trimmed)
    } catch {
      setEditingTitle(goal.title)
    }
  }

  const handleDelete = async () => {
    await deleteGoalByAPI(goal.id)
  }

  const handleRenameClick = () => {
    setIsEditing(true)
    setEditingTitle(goal.title)
  }

  const todo = goal.todoTask ?? 0
  const inProgress = goal.inProgressTask ?? 0
  const done = goal.doneTask ?? 0
  const total = todo + inProgress + done

  return (
    <div
      className={cn(
        "group relative rounded-md bg-white flex flex-col gap-1 transition border",
        isSelected && "bg-blue-100 border-blue-400"
      )}
    >
      {/* Title and checkbox */}
      <div className="flex items-center justify-between w-full px-3 py-2">
        <div className="flex items-center gap-2 w-full">
          {isSelected ? (
            <CheckSquare
              className="cursor-pointer w-4 h-4 text-blue-600"
              onClick={onToggleSelect}
            />
          ) : (
            <Square
              className="cursor-pointer w-4 h-4 text-muted-foreground"
              onClick={onToggleSelect}
            />
          )}

          {isEditing ? (
            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename()
                if (e.key === "Escape") {
                  setIsEditing(false)
                  setEditingTitle(goal.title)
                }
              }}
              autoFocus
              className="text-sm font-medium text-zinc-900 w-full bg-transparent border-0 border-b border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500"
            />
          ) : (
            <span
              className={cn(
                "text-sm font-medium truncate max-w-[140px]",
                isSelected && "text-blue-600"
              )}
            >
              {goal.title}
            </span>
          )}
        </div>

        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 bg-white hover:bg-white text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleRenameClick} className="cursor-pointer">
                <IconPencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
              >
                <IconTrash className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Multi-segment progress bar */}
      <div className="px-3 pb-2">
        <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden flex">
          {total > 0 && (
            <>
              <div
                className="h-full bg-gray-400"
                style={{ width: `${(todo / total) * 100}%` }}
              />
              <div
                className="h-full bg-blue-600"
                style={{ width: `${(inProgress / total) * 100}%` }}
              />
              <div
                className="h-full bg-green-500"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </>
          )}
        </div>
        <div className="text-xs text-zinc-500 mt-1 flex gap-2 flex-wrap">
          <span>{todo} todo</span>
          <span>{inProgress} in progress</span>
          <span>{done} done</span>

        </div>
      </div>
    </div>
  )
}
