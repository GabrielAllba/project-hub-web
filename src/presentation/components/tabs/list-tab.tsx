"use client"

import type React from "react"

import { PRODUCT_BACKLOG_PRIORITY_OPTIONS, PRODUCT_BACKLOG_STATUS_OPTIONS } from "@/constants/constants"
import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog"
import { ProductGoalsProvider } from "@/shared/contexts/product-goals-context"
import {
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
} from "@/shared/utils/product-backlog-utils"
import { Filter, Search, X } from "lucide-react"
import { useState } from "react"
import ListSection from "../section/list-section"
import ProductGoalsSection from "../section/product-goals-section"
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
import { Input } from "../ui/input"

interface ListTabProps {
  projectId: string
}

export const ListTab = ({ projectId }: ListTabProps) => {
  const [showProductGoals, setShowProductGoals] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<ProductBacklogStatus[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<ProductBacklogPriority[]>([])

  const toggleProductGoals = () => {
    setShowProductGoals((prev) => !prev)
  }

  const handleStatusChange = (status: ProductBacklogStatus) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  const handlePriorityChange = (priority: ProductBacklogPriority) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(priority)) {
        return prev.filter((p) => p !== priority)
      } else {
        return [...prev, priority]
      }
    })
  }

  const removeStatusFilter = (status: ProductBacklogStatus, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedStatuses((prev) => prev.filter((s) => s !== status))
  }

  const removePriorityFilter = (priority: ProductBacklogPriority, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedPriorities((prev) => prev.filter((p) => p !== priority))
  }

  const clearFilters = () => {
    setSelectedStatuses([])
    setSelectedPriorities([])
    setSearchQuery("")
  }

  return (
    <ProductGoalsProvider projectId={projectId}>
      <div className="flex flex-col gap-4">
        {/* Filters row */}
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <div className="flex gap-2">
            <Button
              variant={showProductGoals ? "default" : "outline"}
              onClick={toggleProductGoals}
              className="hover:cursor-pointer"
            >
              Product Goals
            </Button>

            {/* Status filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"      className="flex items-center gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Status
                  {selectedStatuses.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                      {selectedStatuses.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-sm">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PRODUCT_BACKLOG_STATUS_OPTIONS.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  >
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedStatuses.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-muted-foreground"
                      onClick={() => setSelectedStatuses([])}
                    >
                      Clear status filters
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
            {(selectedStatuses.length > 0 || selectedPriorities.length > 0 || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                Clear all filters
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks"
              className="pl-9 w-64"
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
        </div>

        {/* Active filters display */}
        {(selectedStatuses.length > 0 || selectedPriorities.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedStatuses.map((status) => (
              <Badge
                key={status}
                variant="outline"
                className={`${getStatusColor(status)} border-none flex items-center gap-1`}
              >
                {getStatusLabel(status)}
                <button
                  onClick={(e) => removeStatusFilter(status, e)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${getStatusLabel(status)} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
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

        {/* Main content */}
        <div className="flex gap-6">
          {showProductGoals && (
            <div className="w-[280px]">
              <ProductGoalsSection projectId={projectId} />
            </div>
          )}

          <div className="flex-1">
            <ListSection
              projectId={projectId}
              statusFilter={selectedStatuses}
              priorityFilter={selectedPriorities}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </ProductGoalsProvider>
  )
}
