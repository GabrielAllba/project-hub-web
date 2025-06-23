"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { BaseResponse } from "@/domain/dto/base-response"
import type { Sprint, SprintStatus } from "@/domain/entities/sprint"
import { useEditSprintGoalAndDates } from "@/shared/hooks/use-edit-sprint-goal-and-dates"
import { useGetTimelineProjectSprints } from "@/shared/hooks/use-get-timeline-project-sprints"
import { useSearchSprintsTimeline } from "@/shared/hooks/use-search-sprint-timeline"
import { getSprintStatusColor, getSprintStatusLabel } from "@/shared/utils/sprint-utils"
import dayjs from "dayjs"
import "dayjs/locale/id"
import { ArrowUpDown, CalendarDays, ChevronDown, Expand, Loader2, Minimize, Plus, Search, X } from 'lucide-react'
import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Rnd } from "react-rnd"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { EmptyStateIllustration } from "../empty/empty-state"
import { LoadingSpinner } from "../loading/loading-spinner"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Input } from "../ui/input"

interface TimelineTabProps {
  projectId: string
}

interface SprintPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
}

interface TimelineDay {
  date: string
  dayOfWeek: string
  dayOfMonth: number
  month: string
  year: number
  isFirstOfMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

interface TimelineData {
  days: TimelineDay[]
  monthGroups: Record<string, TimelineDay[]>
  startDate: dayjs.Dayjs
  endDate: dayjs.Dayjs
}

const TimelineTab: React.FC<TimelineTabProps> = ({ projectId }) => {
  const navigate = useNavigate()
  const { triggerEditSprintGoalAndDates } = useEditSprintGoalAndDates()
  const {
    triggerGetTimelineProjectSprints,
    triggerGetTimelineProjectSprintsResponse,
  } = useGetTimelineProjectSprints(projectId)
  const {
    triggerSearchSprintsTimeline,
    searchSprintsTimelineResponse,
    searchSprintsTimelineLoading } = useSearchSprintsTimeline(projectId)

  // State
  const [visibleYear, setVisibleYear] = useState(dayjs().year())
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sprintPositions, setSprintPositions] = useState<Record<string, SprintPosition>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeDragSprint, setActiveDragSprint] = useState<{ id: string; startDate: string; endDate: string } | null>(
    null,
  )
  const [statusFilter, setStatusFilter] = useState<SprintStatus[]>([])
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  // Load more functionality state
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
  const [hasMoreData, setHasMoreData] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isTimelineLoading, setIsTimelineLoading] = useState(false)

  // Simple search state
  const [isSearchMode, setIsSearchMode] = useState(false)


  // Grid size based on expanded state
  const GRID_SIZE = isExpanded ? 10 : 40 // Width of each day column
  const ROW_HEIGHT = 80 // Height of each sprint row
  const SPRINT_HEIGHT = 60 // Height of sprint block

  // Refs for synchronized scrolling
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const dailyScrollRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set dayjs locale
  useEffect(() => {
    dayjs.locale("en")
  }, [])

  // Initial fetch sprints data
  useEffect(() => {
    if (projectId) {
      if (visibleYear) {
        triggerGetTimelineProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, visibleYear)
      }
    }
  }, [projectId, visibleYear])

  // Handle timeline response data
  useEffect(() => {
    if (triggerGetTimelineProjectSprintsResponse?.data && !isSearchMode) {
      const responseData = triggerGetTimelineProjectSprintsResponse.data

      if (currentPage === DEFAULT_PAGE) {
        setSprints(responseData.content)
        setIsTimelineLoading(false)
      } else {
        setSprints((prev) => {
          const existingIds = new Set(prev.map((sprint) => sprint.id))
          const newSprints = responseData.content.filter((sprint) => !existingIds.has(sprint.id))
          return [...prev, ...newSprints]
        })
      }

      setHasMoreData(responseData.content.length === DEFAULT_PAGE_SIZE && !responseData.last)
      setIsLoadingMore(false)
    }
  }, [triggerGetTimelineProjectSprintsResponse, currentPage, isSearchMode])

  // Auto-detect and change year based on search results
  const detectAndChangeYearFromSprints = (searchSprints: Sprint[]) => {
    if (searchSprints.length === 0) return

    // Get all years from search results
    const sprintYears = searchSprints.map((sprint) => dayjs(sprint.startDate).year())
    const uniqueYears = [...new Set(sprintYears)]

    console.log(`Search results span years: ${uniqueYears.join(", ")}`)

    // If current visible year is not in the search results, change to the most common year
    if (!uniqueYears.includes(visibleYear)) {
      // Count occurrences of each year
      const yearCounts = sprintYears.reduce(
        (acc, year) => {
          acc[year] = (acc[year] || 0) + 1
          return acc
        },
        {} as Record<number, number>,
      )

      // Find the year with most sprints, or earliest year if tied
      const mostCommonYear = uniqueYears.reduce((best, year) => {
        if (yearCounts[year] > yearCounts[best]) return year
        if (yearCounts[year] === yearCounts[best] && year < best) return year
        return best
      })

      toast.info(`Auto-changing year from ${visibleYear} to ${mostCommonYear} based on search results`)

      setVisibleYear(mostCommonYear)

      // Show user notification about year change
      toast.info(
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span>Switched to {mostCommonYear} to show search results</span>
        </div>,
        {
          duration: 4000,
        },
      )
    }
  }

  // Handle search response data
  useEffect(() => {
    if (searchSprintsTimelineResponse?.data && isSearchMode) {
      const responseData = searchSprintsTimelineResponse.data
      console.log(`Search results: ${responseData.content.length} sprints found`)

      // Auto-detect and change year if needed
      detectAndChangeYearFromSprints(responseData.content)

      setSprints(responseData.content)
      setHasMoreData(false) // Simplified: no pagination for search
      setIsTimelineLoading(false)
      setIsLoadingMore(false)
    }
  }, [searchSprintsTimelineResponse, isSearchMode, visibleYear])

  // Simplified search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (searchTerm.trim()) {
        console.log(`Searching for: "${searchTerm}"`)
        setIsSearchMode(true)
        setIsTimelineLoading(true)
        setSprints([])
        setSprintPositions({})

        try {
          await triggerSearchSprintsTimeline(searchTerm, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
        } catch (error) {
          console.error("Search failed:", error)
          toast.error("Search failed")
          setIsTimelineLoading(false)
        }
      } else {
        // Empty search - switch back to timeline mode
        console.log("Empty search - switching to timeline mode")
        setIsSearchMode(false)
        setIsTimelineLoading(true)
        setSprints([])
        setSprintPositions({})
        setCurrentPage(DEFAULT_PAGE)
        setHasMoreData(true)
        triggerGetTimelineProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, visibleYear)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, visibleYear])

  // Load more function (only for timeline mode)
  const loadMoreSprints = async () => {
    if (isLoadingMore || !hasMoreData || isSearchMode) return

    console.log(`Loading more sprints - Current page: ${currentPage}, Current sprints: ${sprints.length}`)

    setIsLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      await triggerGetTimelineProjectSprints(nextPage, DEFAULT_PAGE_SIZE, visibleYear)
      setCurrentPage(nextPage)
      toast.success("Loaded more sprints")
    } catch (error) {
      console.error("Failed to load more sprints:", error)
      toast.error("Failed to load more sprints")
      // Don't change currentPage on error, keep it the same
    } finally {
      // Always reset loading state
      setIsLoadingMore(false)
    }
  }

  // Generate timeline data
  const timelineData: TimelineData = useMemo(() => {
    const startDate = dayjs(`${visibleYear}-01-01`).startOf("day")
    const endDate = dayjs(`${visibleYear}-12-31`).endOf("day")

    const days: TimelineDay[] = []
    let currentDay = startDate.clone()

    while (currentDay.isSame(endDate) || currentDay.isBefore(endDate)) {
      days.push({
        date: currentDay.format("YYYY-MM-DD"),
        dayOfWeek: currentDay.format("ddd").charAt(0),
        dayOfMonth: currentDay.date(),
        month: currentDay.format("MMM").toUpperCase(),
        year: currentDay.year(),
        isFirstOfMonth: currentDay.date() === 1,
        isToday: currentDay.isSame(dayjs(), "day"),
        isWeekend: currentDay.day() === 0 || currentDay.day() === 6,
      })
      currentDay = currentDay.add(1, "day")
    }

    const monthGroups = days.reduce(
      (acc, day) => {
        const key = `${day.month} ${day.year}`
        if (!acc[key]) acc[key] = []
        acc[key].push(day)
        return acc
      },
      {} as Record<string, TimelineDay[]>,
    )

    return { days, monthGroups, startDate, endDate }
  }, [visibleYear])

  // Filter sprints by status (FIXED: proper logic for when no filters are selected)
  const filteredSprints = useMemo(() => {
    let filtered = sprints

    // Apply status filter - if no status filters selected, show all sprints
    if (statusFilter.length > 0) {
      filtered = filtered.filter((sprint) => statusFilter.includes(sprint.status))
    }

    console.log(`Filtered sprints: ${filtered.length} from ${sprints.length} total sprints`)
    console.log(`Status filters applied: ${statusFilter.length > 0 ? statusFilter.join(", ") : "none"}`)

    return filtered
  }, [sprints, statusFilter])

  // Calculate sprint positions
  useEffect(() => {
    console.log("Calculating positions for", filteredSprints.length, "sprints")

    setSprintPositions((prevPositions) => {
      const newPositions: Record<string, SprintPosition> = { ...prevPositions }

      // Keep track of used Y positions to avoid overlaps
      const usedYPositions = new Set<number>()

      // First, preserve existing positions and mark their Y positions as used
      Object.values(prevPositions).forEach((pos) => {
        usedYPositions.add(pos.y)
      })

      // Find the next available Y position
      let nextAvailableY = 10 // Start from 10
      while (usedYPositions.has(nextAvailableY)) {
        nextAvailableY += ROW_HEIGHT
      }

      filteredSprints.forEach((sprint) => {
        const sprintStartDate = dayjs(sprint.startDate)
        const sprintEndDate = dayjs(sprint.endDate)

        // Check if sprint overlaps with the visible timeline range
        if (
          (sprintStartDate.isBefore(timelineData.endDate) || sprintStartDate.isSame(timelineData.endDate, "day")) &&
          (sprintEndDate.isAfter(timelineData.startDate) || sprintEndDate.isSame(timelineData.startDate, "day"))
        ) {
          // Calculate visible portion of the sprint
          const visibleStartDate = sprintStartDate.isBefore(timelineData.startDate)
            ? timelineData.startDate.format("YYYY-MM-DD")
            : sprintStartDate.format("YYYY-MM-DD")

          const visibleEndDate = sprintEndDate.isAfter(timelineData.endDate)
            ? timelineData.endDate.format("YYYY-MM-DD")
            : sprintEndDate.format("YYYY-MM-DD")

          // Find indices in the timeline
          const startIndex = timelineData.days.findIndex((day) => day.date === visibleStartDate)
          const endIndex = timelineData.days.findIndex((day) => day.date === visibleEndDate)

          if (startIndex !== -1 && endIndex !== -1) {
            // Check if this sprint already has a position
            if (newPositions[sprint.id]) {
              // Update X and width, but keep the existing Y position
              newPositions[sprint.id] = {
                ...newPositions[sprint.id],
                x: startIndex * GRID_SIZE,
                width: (endIndex - startIndex + 1) * GRID_SIZE,
              }
            } else {
              // New sprint - assign next available Y position
              const yPosition = nextAvailableY
              newPositions[sprint.id] = {
                id: sprint.id,
                x: startIndex * GRID_SIZE,
                y: yPosition,
                width: (endIndex - startIndex + 1) * GRID_SIZE,
                height: SPRINT_HEIGHT,
              }

              usedYPositions.add(yPosition)
              nextAvailableY += ROW_HEIGHT
            }
          }
        }
      })

      // Remove positions for sprints that are no longer in filteredSprints
      const filteredSprintIds = new Set(filteredSprints.map((s) => s.id))
      Object.keys(newPositions).forEach((sprintId) => {
        if (!filteredSprintIds.has(sprintId)) {
          delete newPositions[sprintId]
        }
      })

      return newPositions
    })
  }, [filteredSprints, timelineData, GRID_SIZE])

  // Utility functions
  const getDateFromPosition = (x: number): string => {
    const dayIndex = Math.floor(x / GRID_SIZE)
    return timelineData.days[dayIndex]?.date || ""
  }

  const getEndDateFromStartAndWidth = (startDate: string, width: number): string => {
    const startIndex = timelineData.days.findIndex((day) => day.date === startDate)
    if (startIndex === -1) return ""

    const daysSpan = Math.floor(width / GRID_SIZE) - 1
    const endIndex = startIndex + daysSpan

    return timelineData.days[endIndex]?.date || ""
  }

  // Auto-scroll to show filtered/searched sprints
  const scrollToFirstVisibleSprint = () => {
    if (!timelineScrollRef.current || filteredSprints.length === 0) return

    // Find the earliest sprint date among filtered sprints
    const earliestSprint = filteredSprints.reduce((earliest, sprint) => {
      const sprintDate = dayjs(sprint.startDate)
      const earliestDate = dayjs(earliest.startDate)
      return sprintDate.isBefore(earliestDate) ? sprint : earliest
    })

    // Find the position of the earliest sprint
    const sprintStartDate = dayjs(earliestSprint.startDate)
    const dayIndex = timelineData.days.findIndex(
      (day) => dayjs(day.date).isSame(sprintStartDate, "day") || dayjs(day.date).isAfter(sprintStartDate, "day"),
    )

    if (dayIndex !== -1) {
      // Scroll to show the sprint with some padding
      const scrollPosition = Math.max(0, dayIndex * GRID_SIZE - 200) // 200px padding from left
      timelineScrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }

  // Event handlers
  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollLeft
    }
    if (dailyScrollRef.current) {
      dailyScrollRef.current.scrollLeft = scrollLeft
    }
  }

  const removeStatusFilter = (status: SprintStatus, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setStatusFilter((prev) => prev.filter((s) => s !== status))
  }

  const clearAllFilters = () => {
    setStatusFilter([])
  }

  const handleSprintUpdate = async (sprintId: string, newStartDate: string, newEndDate: string) => {
    // Cache the previous state
    const prevSprint = sprints.find((s) => s.id === sprintId)
    const prevPosition = sprintPositions[sprintId]

    try {
      await triggerEditSprintGoalAndDates({
        sprintId,
        startDate: dayjs(newStartDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
        endDate: dayjs(newEndDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
      })

      // Update sprint in state on success
      setSprints((prev) =>
        prev.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, startDate: newStartDate, endDate: newEndDate } : sprint,
        ),
      )
    } catch (error) {
      const baseError = error as BaseResponse<null>
      toast.error("Failed to update sprint: " + baseError.message)

      // Restore previous sprint data
      if (prevSprint) {
        setSprints((prev) => prev.map((sprint) => (sprint.id === sprintId ? prevSprint : sprint)))
      }

      // Restore previous visual position
      if (prevPosition) {
        setSprintPositions((prev) => ({
          ...prev,
          [sprintId]: prevPosition,
        }))
      }
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Handle manual year change
  const handleYearChange = (newYear: number) => {
    setVisibleYear(newYear)
  }

  // Scroll to today when timeline data changes (but not during search/filter)
  useEffect(() => {
    if (timelineScrollRef.current && !isTimelineLoading && !isSearchMode && statusFilter.length === 0) {
      const todayIndex = timelineData.days.findIndex((day) => day.isToday)
      if (todayIndex !== -1) {
        const scrollPosition = todayIndex * GRID_SIZE - timelineScrollRef.current.clientWidth / 2
        timelineScrollRef.current.scrollLeft = Math.max(0, scrollPosition)
      }
    }
  }, [timelineData.days, GRID_SIZE, isTimelineLoading, isSearchMode, statusFilter])

  // Auto-scroll to show filtered/searched results
  useEffect(() => {
    if (!isTimelineLoading && filteredSprints.length > 0 && (isSearchMode || statusFilter.length > 0)) {
      // Small delay to ensure positions are calculated
      const timeoutId = setTimeout(() => {
        scrollToFirstVisibleSprint()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [filteredSprints, isSearchMode, statusFilter, isTimelineLoading, sprintPositions])

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search sprints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />

            {searchSprintsTimelineLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Status
                {statusFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {statusFilter.length}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {["COMPLETED", "IN_PROGRESS", "NOT_STARTED"].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onSelect={(e) => {
                    e.preventDefault()
                    setStatusFilter((prev) =>
                      prev.includes(status as SprintStatus)
                        ? prev.filter((s) => s !== status)
                        : [...prev, status as SprintStatus],
                    )
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input type="checkbox" readOnly checked={statusFilter.includes(status as SprintStatus)} />
                    <span className="capitalize">{status.replace("_", " ").toLowerCase()}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleExpand} className="mr-2">
            {isExpanded ? <Minimize className="w-4 h-4 mr-2" /> : <Expand className="w-4 h-4 mr-2" />}
            {isExpanded ? "Minimize" : "Expand"}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleYearChange(visibleYear - 1)}>
              ← {visibleYear - 1}
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{visibleYear}</span>

            </div>
            <Button variant="outline" size="sm" onClick={() => handleYearChange(visibleYear + 1)}>
              {visibleYear + 1} →
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(statusFilter.length > 0 || isSearchMode) && (
        <div className="flex flex-wrap gap-2 items-center px-4 py-2 bg-blue-50 border-b">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {isSearchMode && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
              Search: "{searchTerm}"
              <button
                onClick={clearSearch}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter.map((status) => (
            <Badge
              key={status}
              variant="outline"
              className={`${getSprintStatusColor(status)} border-none flex items-center gap-1`}
            >
              {getSprintStatusLabel(status)}
              <button
                onClick={(e) => removeStatusFilter(status, e)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${getSprintStatusLabel(status)} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {statusFilter.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs">
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Timeline Header */}
      <div className="flex flex-col border-b bg-white flex-shrink-0">
        {/* Month Names Row */}
        <div className="flex">
          <div
            ref={headerScrollRef}
            className="flex overflow-x-hidden flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex" style={{ width: `${timelineData.days.length * GRID_SIZE}px` }}>
              {Object.entries(timelineData.monthGroups).map(([monthYear, days]) => (
                <div
                  key={monthYear}
                  className="flex items-center justify-center border-r border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-inner"
                  style={{ width: `${days.length * GRID_SIZE}px`, height: "48px" }}
                >
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-100 tracking-wide">
                    {monthYear}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Dates Row - Only show if not expanded */}
        {!isExpanded && (
          <div className="flex">
            <div
              ref={dailyScrollRef}
              className="flex overflow-x-hidden flex-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex" style={{ width: `${timelineData.days.length * GRID_SIZE}px` }}>
                {timelineData.days.map((day) => (
                  <div
                    key={day.date}
                    className={`flex flex-col items-center justify-center border-r flex-shrink-0 transition-colors duration-200 ease-in-out
              ${day.isToday
                        ? "bg-gradient-to-br from-[#2563EB]/10 to-[#5325eb]/10 border-blue-400 dark:border-blue-600 shadow-sm"
                        : day.isWeekend
                          ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                          : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800"
                      }
            `}
                    style={{ width: `${GRID_SIZE}px`, height: "48px" }}
                  >
                    <span className="text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                      {day.dayOfWeek}
                    </span>
                    <span
                      className={`text-sm font-medium ${day.isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-800 dark:text-zinc-100"
                        }`}
                    >
                      {day.dayOfMonth}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content with Simple Loading */}
      {isTimelineLoading ? (
        <LoadingSpinner message={isSearchMode ? `Searching for "${searchTerm}"...` : "Loading timeline data..."} />
      ) : (
        <>
          {/* Empty State - No Sprints & Search*/}
          {filteredSprints.length === 0 && sprints.length === 0 && isSearchMode && (
            <EmptyStateIllustration type="no-search" />
          )}
          {/* Empty State - No Sprints & */}
          {filteredSprints.length === 0 && sprints.length === 0 && !isSearchMode && (
            <EmptyStateIllustration size="sm" type="no-sprints"></EmptyStateIllustration>)}

          {/* Empty State - No Filter Results */}
          {filteredSprints.length === 0 && sprints.length > 0 && <EmptyStateIllustration type="no-filter" />}

          {/* Timeline Content */}
          {filteredSprints.length > 0 && (
            <div className="flex flex-1 overflow-hidden">
              {/* Timeline Grid */}
              <div ref={timelineScrollRef} className="flex-1 overflow-auto" onScroll={handleTimelineScroll}>
                <div
                  className="relative bg-white"
                  style={{
                    width: `${timelineData.days.length * GRID_SIZE}px`,
                    height: `${Math.max(Object.values(sprintPositions).reduce((maxY, pos) => Math.max(maxY, pos.y + pos.height), 0) + 100, 500)}px`,
                  }}
                >
                  {/* Grid Lines */}
                  {timelineData.days.map((day, index) => (
                    <div
                      key={day.date}
                      className={`absolute top-0 bottom-0 border-r ${day.isToday
                        ? "border-blue-400 bg-blue-50"
                        : day.isWeekend
                          ? "border-gray-200 bg-gray-50"
                          : "border-gray-100"
                        }`}
                      style={{ left: `${index * GRID_SIZE}px`, width: "1px" }}
                    />
                  ))}

                  {/* Row Lines */}
                  {filteredSprints.map((_, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0 border-b border-gray-50"
                      style={{ top: `${index * ROW_HEIGHT}px`, height: "1px" }}
                    />
                  ))}

                  {/* Sprint Blocks */}
                  {filteredSprints.map((sprint) => {
                    const position = sprintPositions[sprint.id]
                    if (!position) return null

                    // Get current dates for this sprint (either from active drag or from sprint data)
                    const currentStartDate =
                      activeDragSprint?.id === sprint.id ? activeDragSprint.startDate : sprint.startDate

                    const currentEndDate =
                      activeDragSprint?.id === sprint.id ? activeDragSprint.endDate : sprint.endDate

                    // Check if sprint extends beyond visible range
                    const sprintStartDate = dayjs(sprint.startDate)
                    const sprintEndDate = dayjs(sprint.endDate)
                    const extendsLeft = sprintStartDate.isBefore(timelineData.startDate)
                    const extendsRight = sprintEndDate.isAfter(timelineData.endDate)

                    return (
                      <Rnd
                        key={sprint.id}
                        size={{ width: position.width, height: position.height }}
                        position={{ x: position.x, y: position.y }}
                        dragGrid={[GRID_SIZE, ROW_HEIGHT]}
                        resizeGrid={[GRID_SIZE, ROW_HEIGHT]}
                        bounds="parent"
                        minWidth={GRID_SIZE}
                        minHeight={SPRINT_HEIGHT}
                        maxHeight={SPRINT_HEIGHT}
                        enableResizing={{
                          top: false,
                          right: true,
                          bottom: false,
                          left: true,
                          topRight: false,
                          bottomRight: false,
                          bottomLeft: false,
                          topLeft: false,
                        }}
                        dragAxis="x"
                        onDragStart={() => {
                          setActiveDragSprint({
                            id: sprint.id,
                            startDate: sprint.startDate,
                            endDate: sprint.endDate,
                          })
                        }}
                        onDrag={(e, data) => {
                          const newStartDate = getDateFromPosition(data.x)
                          const newEndDate = getEndDateFromStartAndWidth(newStartDate, position.width)

                          setSprintPositions((prev) => ({
                            ...prev,
                            [sprint.id]: { ...prev[sprint.id], x: data.x },
                          }))

                          setActiveDragSprint({
                            id: sprint.id,
                            startDate: newStartDate,
                            endDate: newEndDate,
                          })
                        }}
                        onDragStop={(e, data) => {
                          const newStartDate = getDateFromPosition(data.x)
                          const newEndDate = getEndDateFromStartAndWidth(newStartDate, position.width)

                          if (newStartDate && newEndDate) {
                            handleSprintUpdate(sprint.id, newStartDate, newEndDate)
                          }

                          setActiveDragSprint(null)
                        }}
                        onResizeStart={() => {
                          setActiveDragSprint({
                            id: sprint.id,
                            startDate: sprint.startDate,
                            endDate: sprint.endDate,
                          })
                        }}
                        onResize={(e, direction, ref, delta, newPosition) => {
                          const newWidth = ref.offsetWidth
                          const prevY = sprintPositions[sprint.id].y
                          const newX = newPosition.x

                          const newStartDate = getDateFromPosition(newX)
                          const newEndDate = getEndDateFromStartAndWidth(newStartDate, newWidth)

                          setSprintPositions((prev) => ({
                            ...prev,
                            [sprint.id]: {
                              ...prev[sprint.id],
                              width: newWidth,
                              x: newX,
                              y: prevY,
                            },
                          }))

                          setActiveDragSprint({
                            id: sprint.id,
                            startDate: newStartDate,
                            endDate: newEndDate,
                          })
                        }}
                        onResizeStop={(e, direction, ref, delta, newPosition) => {
                          const newWidth = ref.offsetWidth
                          const newX = newPosition.x
                          const prevY = sprintPositions[sprint.id].y
                          const newStartDate = getDateFromPosition(newX)
                          const newEndDate = getEndDateFromStartAndWidth(newStartDate, newWidth)

                          setSprintPositions((prev) => ({
                            ...prev,
                            [sprint.id]: {
                              ...prev[sprint.id],
                              width: newWidth,
                              x: newX,
                              y: prevY,
                            },
                          }))

                          if (newStartDate && newEndDate) {
                            handleSprintUpdate(sprint.id, newStartDate, newEndDate)
                          }

                          setActiveDragSprint(null)
                        }}
                      >
                        <div
                          className="w-full h-full bg-white shadow-sm cursor-move overflow-hidden flex rounded-sm"
                          style={{
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          {/* Status indicator */}
                          <div className={`w-1 h-full ${getSprintStatusColor(sprint.status)}`} />
                          <div className="flex flex-col justify-center p-2 w-full">
                            <div className="text-xs font-medium mb-1 truncate">
                              <span
                                className="hover:underline hover:cursor-pointer"
                                onClick={() => {
                                  navigate(`/dashboard/project/${sprint.projectId}?tab=report&sprintId=${sprint.id}`, { replace: true })
                                }}>
                                {sprint.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <div className="text-xs text-gray-500 w-full">
                                <p className="truncate text-xs max-w-3/4">
                                  {extendsLeft ? "←" : ""} {dayjs(currentStartDate).format("D MMM YYYY")} -{" "}
                                  {dayjs(currentEndDate).format("D MMM YYYY")} {extendsRight ? "→" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Rnd>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Load More Button - only show in timeline mode */}
          {!isSearchMode && hasMoreData && filteredSprints.length > 0 && (
            <div className="p-4 border-t bg-gray-50 flex justify-center">
              <Button
                onClick={() => {
                  setIsButtonDisabled(true)
                  loadMoreSprints().finally(() => {
                    setTimeout(() => setIsButtonDisabled(false), 1000)
                  })
                }}
                disabled={isLoadingMore || isButtonDisabled}
                variant="outline"
                size="lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading More Sprints...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Load More Sprints
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TimelineTab
