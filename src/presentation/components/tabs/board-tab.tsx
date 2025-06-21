"use client"

import type React from "react"

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PRODUCT_BACKLOG_PRIORITY_OPTIONS
} from "@/constants/constants"
import type { ProductBacklogPriority } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { useGetProjectSprintsInProgress } from "@/shared/hooks/use-get-project-sprints-in-progress"
import {
  getPriorityColor,
  getPriorityLabel
} from "@/shared/utils/product-backlog-utils"
import { Filter, FootprintsIcon, X } from "lucide-react"
import { useEffect, useState } from "react"
import BoardSection from "../section/board-section"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface BoardTabProps {
  projectId: string
}

export const BoardTab = ({ projectId }: BoardTabProps) => {
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<ProductBacklogPriority[]>([])

  const { triggerGetProjectSprintsInProgress } = useGetProjectSprintsInProgress(projectId)

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const res = await triggerGetProjectSprintsInProgress(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
        if (res.status === "success" && res.data?.content) {
          setSprints(res.data.content)
          // Always reset to the first sprint when projectId changes
          if (res.data.content.length > 0) {
            setSelectedSprintId(res.data.content[0].id)
          } else {
            setSelectedSprintId("")
          }
        }
      } catch (err) {
        console.error("Failed to fetch in-progress sprints:", err)
      }
    }

    fetchSprints()
  }, [projectId])


  const handlePriorityChange = (priority: ProductBacklogPriority) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(priority)) {
        return prev.filter((p) => p !== priority)
      } else {
        return [...prev, priority]
      }
    })
  }

  const removePriorityFilter = (priority: ProductBacklogPriority, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedPriorities((prev) => prev.filter((p) => p !== priority))
  }

  const clearFilters = () => {
    setSelectedPriorities([])
  }

  const hasActiveFilters = selectedPriorities.length > 0

  return (
    <div className="space-y-6">



      {/* Filters */}
      <div className="flex flex-wrap justify-start items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Sprint Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sprint:</span>
          <Select value={selectedSprintId} onValueChange={setSelectedSprintId} disabled={sprints.length === 0}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <SelectValue placeholder="No active sprints" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {sprints.length > 0 ? (
                sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    <div className="flex items-center gap-2">
                      <FootprintsIcon className="w-4 h-4 text-blue-500" />
                      <span>{sprint.name}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="text-sm text-muted-foreground px-4 py-2">No sprints in progress</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Priority filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4 mr-1" />
              Priority
              {selectedPriorities.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {selectedPriorities.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-sm">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRODUCT_BACKLOG_PRIORITY_OPTIONS.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={selectedPriorities.includes(priority)}
                onCheckedChange={() => handlePriorityChange(priority)}
              >
                <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${getPriorityColor(priority)}`}>
                  {getPriorityLabel(priority)}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
            {selectedPriorities.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-muted-foreground"
                  onClick={() => setSelectedPriorities([])}
                >
                  Clear priority filters
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear all filters button */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="w-3 h-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedPriorities.map((priority) => (
            <Badge
              key={priority}
              variant="outline"
              className={`${getPriorityColor(priority)} border-none flex items-center gap-1`}
            >
              {getPriorityLabel(priority)}
              <button
                onClick={(e) => removePriorityFilter(priority, e)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${getPriorityLabel(priority)} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      <BoardSection
        key={"board-" + selectedSprintId}
        sprintId={selectedSprintId}
        priorityFilters={selectedPriorities}
      />
    </div>
  )
}
