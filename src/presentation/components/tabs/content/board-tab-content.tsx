"use client"

import type React from "react"

import {
    PRODUCT_BACKLOG_PRIORITY_OPTIONS
} from "@/constants/constants"
import type { ProductBacklogPriority } from "@/domain/entities/product-backlog"
import { useProjectMembers } from "@/shared/contexts/project-member-context"
import { useSprint } from "@/shared/contexts/sprint-context"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getPriorityColor, getPriorityLabel, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { Filter, FootprintsIcon, User, X } from "lucide-react"
import { useState } from "react"
import { BacklogDetailDrawer } from "../../backlog-detail-drawer/backlog-detail-drawer"
import BoardSection from "../../section/board-section"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../../ui/select"

export const BoardTabContent = () => {
    const { members } = useProjectMembers()

    const {
        sprintsInProgress,
        selectedSprintId,
        setSelectedSprintId,
    } = useSprint()

    const [selectedPriorities, setSelectedPriorities] = useState<ProductBacklogPriority[]>([])
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([])

    const handlePriorityChange = (priority: ProductBacklogPriority) => {
        setSelectedPriorities((prev) =>
            prev.includes(priority)
                ? prev.filter((p) => p !== priority)
                : [...prev, priority]
        )
    }

    const handleAssigneeIdChange = (assigneeId: string) => {
        setSelectedAssigneeIds((prev) =>
            prev.includes(assigneeId)
                ? prev.filter((p) => p !== assigneeId)
                : [...prev, assigneeId]
        )
    }

    const removePriorityFilter = (priority: ProductBacklogPriority, event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setSelectedPriorities((prev) => prev.filter((p) => p !== priority))
    }
    const removeAssigneeIdFilter = (assigneeId: string, event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setSelectedAssigneeIds((prev) => prev.filter((p) => p !== assigneeId))
    }



    const clearFilters = () => {
        setSelectedPriorities([])
        setSelectedAssigneeIds([])
    }

    const hasActiveFilters = selectedPriorities.length > 0 || selectedAssigneeIds.length > 0

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
                    <Select
                        value={selectedSprintId}
                        onValueChange={setSelectedSprintId}
                        disabled={sprintsInProgress.length === 0}
                    >
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <SelectValue placeholder="No active sprints" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {sprintsInProgress.length > 0 ? (
                                sprintsInProgress.map((sprint) => (
                                    <SelectItem key={sprint.id} value={sprint.id}>
                                        <div className="flex items-center gap-2">
                                            <FootprintsIcon className="w-4 h-4 text-blue-500" />
                                            <span>{sprint.name}</span>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground px-4 py-2">
                                    No sprints in progress
                                </div>
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
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-sm ${getPriorityColor(priority)}`}
                                >
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
                {/* Assignee Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Assignee
                            {selectedAssigneeIds && selectedAssigneeIds?.length > 0 && <Badge className="ml-1 bg-gray-100 text-black">{selectedAssigneeIds.length}</Badge>}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto">
                        <DropdownMenuLabel>Filter by Assignees</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {members.map(user => (
                            <DropdownMenuCheckboxItem
                                key={user.id}
                                checked={selectedAssigneeIds && selectedAssigneeIds.includes(user.id)}
                                onCheckedChange={() => handleAssigneeIdChange(user.id)}
                            >
                                <Avatar className="cursor-pointer h-6 w-6 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                    <AvatarFallback
                                        className={cn("text-sm font-semibold text-white bg-gradient-to-br", getGradientForUser(user.username.charAt(0).toUpperCase()))}
                                    >
                                        {getUserInitials(user.username.charAt(0).toUpperCase())}
                                    </AvatarFallback>
                                </Avatar>
                                {user.username}
                            </DropdownMenuCheckboxItem>
                        ))}
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
                    {selectedAssigneeIds.map((assigneeId) => {
                        const user = members.find((m) => m.id === assigneeId)

                        return (
                            <Badge
                                key={assigneeId}
                                variant="outline"
                                className="border-none flex items-center gap-1"
                            >
                                {user?.username || "Unknown"}
                                <button
                                    onClick={(e) => removeAssigneeIdFilter(assigneeId, e)}
                                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                                    aria-label={`Remove ${user?.username || assigneeId} filter`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )
                    })}

                </div>
            )}

            {/* Content */}
            <BoardSection
                key={"board-" + selectedSprintId}
                priorityFilters={selectedPriorities}
                assigneeIdFilters={selectedAssigneeIds}
            />
            <BacklogDetailDrawer />
        </div>
    )
}