"use client"

import {
  PRODUCT_BACKLOG_PRIORITY_OPTIONS,
  PRODUCT_BACKLOG_STATUS_OPTIONS,
} from "@/constants/constants"
import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog"
import { useBacklog } from "@/shared/contexts/backlog-context"
import { useProjectMembers } from "@/shared/contexts/project-member-context"
import { useSprint } from "@/shared/contexts/sprint-context"
import { cn } from "@/shared/utils/merge-class"
import {
  getGradientForUser,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  getUserInitials,
} from "@/shared/utils/product-backlog-utils"
import { CheckSquare, Filter, Search, Square, User, X } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BacklogDetailDrawer } from "../../backlog-detail-drawer/backlog-detail-drawer"
import ListSection from "../../section/list-section"
import ProductGoalsSection from "../../section/product-goals-section"
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
import { Input } from "../../ui/input"


export const ListTabContent = ({ projectId }: { projectId: string }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [showProductGoals, setShowProductGoals] = useState(true)

  const { members } = useProjectMembers()

  const {
    search: searchSprintBacklog,
    setSearch: setSearchSprintBacklog,
    status: statusSprintBacklog,
    setStatus: setStatusSprintBacklog,
    priority: prioritySprintBacklog,
    setPriority: setPrioritySprintBacklog,
    assigneeIds: assigneeIdsSprintBacklog,
    setAssigneeIds: setAssigneeIdsSprintBacklog

  } = useSprint()

  const {
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    assigneeIds,
    setAssigneeIds
  } = useBacklog()

  const toggleProductGoals = () => {
    setShowProductGoals((prev) => !prev)
  }

  const handleStatusChange = (newStatus: ProductBacklogStatus) => {
    setStatus(status === newStatus ? undefined : newStatus)
    setStatusSprintBacklog(statusSprintBacklog === newStatus ? undefined : newStatus)
  }

  const handlePriorityChange = (newPriority: ProductBacklogPriority) => {
    setPriority(priority === newPriority ? undefined : newPriority)
    setPrioritySprintBacklog(prioritySprintBacklog === newPriority ? undefined : newPriority)
  }

  const removeStatusFilter = (s: ProductBacklogStatus, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setStatus(undefined)
    setStatusSprintBacklog(undefined)
  }

  const removePriorityFilter = (p: ProductBacklogPriority, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPriority(undefined)
    setPrioritySprintBacklog(undefined)
  }

  const clearFilters = () => {
    setStatus(undefined)
    setPriority(undefined)
    setSearch("")
    setSearchInput("")
    setAssigneeIds([])

    setStatusSprintBacklog(undefined)
    setPrioritySprintBacklog(undefined)
    setSearchSprintBacklog("")
    setAssigneeIdsSprintBacklog([])

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('search');
    setSearchParams(newSearchParams);
  }

  const handleAssigneeToggle = (id: string) => {
    const updated = assigneeIds?.includes(id)
      ? assigneeIds.filter((a) => a !== id)
      : [...assigneeIds || [], id]
    setAssigneeIds(updated)

    const updatedAssigneeIdsSprintBacklog = assigneeIdsSprintBacklog?.includes(id)
      ? assigneeIdsSprintBacklog.filter((a) => a !== id)
      : [...assigneeIdsSprintBacklog || [], id]

    setAssigneeIdsSprintBacklog(updatedAssigneeIdsSprintBacklog)
  }


  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setSearchSprintBacklog(searchInput)


      const newSearchParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newSearchParams.set('search', searchInput);
      } else {
        newSearchParams.delete('search');
      }
      setSearchParams(newSearchParams);

    }, 500)

    return () => clearTimeout(timeout)
  }, [searchInput, setSearch, setSearchSprintBacklog, searchParams, setSearchParams])


  useEffect(() => {
    const urlSearchParam = searchParams.get('search') || '';
    if (urlSearchParam !== searchInput) {
      setSearchInput(urlSearchParam);
    }
  }, [searchParams]);


  return (
    <div className="flex flex-col gap-4">
      {/* Filters row */}
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div className="flex gap-2">
          <Button
            onClick={toggleProductGoals}
            variant="outline"
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            {showProductGoals ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
            Show Product Goals
          </Button>


          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Status
                {status && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-sm">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRODUCT_BACKLOG_STATUS_OPTIONS.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={status === s}
                  onCheckedChange={() => handleStatusChange(s)}
                >
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${getStatusColor(s)}`}>
                    {getStatusLabel(s)}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
              {status && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-muted-foreground"
                    onClick={() => setStatus(undefined)}
                  >
                    Clear status filter
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
                {priority && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-sm">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRODUCT_BACKLOG_PRIORITY_OPTIONS.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priority === p}
                  onCheckedChange={() => handlePriorityChange(p)}
                >
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${getPriorityColor(p)}`}>
                    {getPriorityLabel(p)}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
              {priority && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-muted-foreground"
                    onClick={() => setPriority(undefined)}
                  >
                    Clear priority filter
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
                {assigneeIds && assigneeIds?.length > 0 && <Badge className="ml-1 bg-gray-100 text-black">{assigneeIds.length}</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto">
              <DropdownMenuLabel>Filter by Assignees</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {members.map(user => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={assigneeIds && assigneeIds.includes(user.id)}
                  onCheckedChange={() => handleAssigneeToggle(user.id)}
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
          {(status || priority || search || statusSprintBacklog || prioritySprintBacklog || searchSprintBacklog) && (
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />



        </div>
      </div>

      {/* Active filters */}
      {(status || priority || (assigneeIds && assigneeIds.length > 0)) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {status && (
            <Badge
              key={status}
              variant="outline"
              className={`${getStatusColor(status)} border-none flex items-center gap-1`}
            >
              {getStatusLabel(status)}
              <button
                onClick={(e) => removeStatusFilter(status, e)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {priority && (
            <Badge
              key={priority}
              variant="outline"
              className={`${getPriorityColor(priority)} border-none flex items-center gap-1`}
            >
              {getPriorityLabel(priority)}
              <button
                onClick={(e) => removePriorityFilter(priority, e)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {assigneeIds &&
            assigneeIds.length > 0 &&
            assigneeIds.map((id) => {
              const user = members.find((m) => m.id === id)
              if (!user) return null
              return (
                <Badge
                  key={id}
                  variant="outline"
                  className="border-none flex items-center gap-1 bg-muted"
                >
                  {user.username}
                  <button
                    onClick={() => {
                      setAssigneeIds(assigneeIds.filter((assigneeId) => assigneeId !== id))
                      if (assigneeIdsSprintBacklog) {
                        setAssigneeIdsSprintBacklog(assigneeIdsSprintBacklog.filter((assigneeId) => assigneeId !== id))
                      }
                    }
                    }
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
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
          <ListSection />
        </div>
        <BacklogDetailDrawer />
      </div>
    </div>
  )
}
