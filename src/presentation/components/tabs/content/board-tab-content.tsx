"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import {
    PRODUCT_BACKLOG_PRIORITY_OPTIONS,
} from "@/constants/constants"

import { useProjectMembers } from "@/shared/contexts/project-member-context"
import { useGetSprintById } from "@/shared/hooks/use-get-sprint-by-id"

import { Filter, User, X } from "lucide-react"
import { toast } from "sonner"

import type { ProductBacklogPriority } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"
import { useSprint } from "@/shared/contexts/sprint-context"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getPriorityColor, getPriorityLabel, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { BacklogDetailDrawer } from "../../backlog-detail-drawer/backlog-detail-drawer"
import { SprintSearchPopover } from "../../dialog/sprint-search-popover"
import { EmptyStateIllustration } from "../../empty/empty-state"
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

export const BoardTabContent = ({ projectId }: { projectId: string }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const sprintIdFromQuery = new URLSearchParams(location.search).get("sprintId")

    const { triggerGetSprintById } = useGetSprintById("")
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
    const [sprintFetchFailed, setSprintFetchFailed] = useState(false)

    const [selectedPriorities, setSelectedPriorities] = useState<ProductBacklogPriority[]>([])
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([])

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const { members } = useProjectMembers()
    const { setSelectedSprintId } = useSprint()

    const handlePriorityChange = (priority: ProductBacklogPriority) => {
        setSelectedPriorities((prev) =>
            prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
        )
    }

    const handleAssigneeIdChange = (assigneeId: string) => {
        setSelectedAssigneeIds((prev) =>
            prev.includes(assigneeId) ? prev.filter((p) => p !== assigneeId) : [...prev, assigneeId]
        )
    }

    const clearFilters = () => {
        setSelectedPriorities([])
        setSelectedAssigneeIds([])
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

    const hasActiveFilters = selectedPriorities.length > 0 || selectedAssigneeIds.length > 0

    useEffect(() => {
        const fetchSprint = async () => {
            if (!sprintIdFromQuery) return

            try {
                const res = await triggerGetSprintById(sprintIdFromQuery)
                if (res.status === "success" && res.data) {
                    setSelectedSprint(res.data)
                    setSelectedSprintId(res.data.id)
                    setSprintFetchFailed(false)
                } else {
                    setSprintFetchFailed(true)
                    toast.error("Failed to load sprint", {
                        description: res.message,
                    })
                }
            } catch (err) {
                setSprintFetchFailed(true)
                toast.error("Unexpected error while fetching sprint: " + err)
            }
        }

        fetchSprint()
    }, [sprintIdFromQuery])

    return (
        <div className="space-y-6">
            <SprintSearchPopover
                projectId={projectId}
                isOpen={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSprint={selectedSprint}
                onSprintSelect={(sprint) => {
                    setSelectedSprint(sprint)
                    setSprintFetchFailed(false)
                    setIsSearchOpen(false)
                    navigate(`?tab=board&sprintId=${sprint.id}`, { replace: true })
                }}
            />

            <div className="flex flex-wrap justify-start items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

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
                                <span className={`px-2 text-xs font-medium rounded-sm ${getPriorityColor(priority)}`}>
                                    {getPriorityLabel(priority)}
                                </span>
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Assignee
                            {selectedAssigneeIds.length > 0 && (
                                <Badge className="ml-1 bg-gray-100 text-black">
                                    {selectedAssigneeIds.length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto">
                        <DropdownMenuLabel>Filter by Assignees</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {members.map((user) => (
                            <DropdownMenuCheckboxItem
                                key={user.id}
                                checked={selectedAssigneeIds.includes(user.id)}
                                onCheckedChange={() => handleAssigneeIdChange(user.id)}
                            >
                                <Avatar className="cursor-pointer h-6 w-6 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                    <AvatarFallback
                                        className={cn(
                                            "text-sm font-semibold text-white bg-gradient-to-br",
                                            getGradientForUser(user.username.charAt(0).toUpperCase())
                                        )}
                                    >
                                        {getUserInitials(user.username.charAt(0).toUpperCase())}
                                    </AvatarFallback>
                                </Avatar>
                                {user.username}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="w-3 h-3 mr-1" />
                        Clear Filters
                    </Button>
                )}
            </div>

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

            {sprintIdFromQuery && sprintFetchFailed ? (
                <div className="p-8">
                    <EmptyStateIllustration type="no-sprints" />
                </div>
            ) : selectedSprint ? (
                <>
                    <BoardSection
                        key={"board-" + selectedSprint.id}
                        priorityFilters={selectedPriorities}
                        assigneeIdFilters={selectedAssigneeIds}
                    />
                    <BacklogDetailDrawer />
                </>
            ) : (
                <div className="p-8">
                    <EmptyStateIllustration type="no-sprints" />
                </div>
            )}
        </div>
    )
}