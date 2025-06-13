"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { Sprint, SprintStatus } from "@/domain/entities/sprint"
import { useEditSprintGoalAndDates } from "@/shared/hooks/use-edit-sprint-goal-and-dates"
import { useGetProjectSprints } from "@/shared/hooks/use-get-project-sprints"
import { getSprintStatusColor, getSprintStatusLabel } from "@/shared/utils/sprint-utils"
import dayjs from "dayjs"
import "dayjs/locale/id"; // Import Indonesian locale
import { ArrowUpDown, Calendar, ChevronDown, Expand, Minimize, MoreVertical, Search, X } from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Rnd } from "react-rnd"
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

type TimeRange = "6months" | "1year"

const TimelineTab: React.FC<TimelineTabProps> = ({ projectId }) => {
  const { triggerEditSprintGoalAndDates } = useEditSprintGoalAndDates()
  const { triggerGetProjectSprints, triggerGetProjectSprintsResponse } = useGetProjectSprints(projectId)

  // State
  const [timeRange, setTimeRange] = useState<TimeRange>("6months")
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sprintPositions, setSprintPositions] = useState<Record<string, SprintPosition>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeDragSprint, setActiveDragSprint] = useState<{ id: string; startDate: string; endDate: string } | null>(
    null,
  )
  const [statusFilter, setStatusFilter] = useState<SprintStatus[]>([])


  // Grid size based on expanded state
  const GRID_SIZE = isExpanded ? 10 : 40 // Width of each day column
  const ROW_HEIGHT = 80 // Height of each sprint row
  const SPRINT_HEIGHT = 60 // Height of sprint block

  // Refs for synchronized scrolling
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const dailyScrollRef = useRef<HTMLDivElement>(null)

  // Set dayjs locale
  useEffect(() => {
    dayjs.locale("id")
  }, [])

  // Fetch sprints data
  useEffect(() => {
    if (projectId) {
      triggerGetProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
    }
  }, [projectId])

  useEffect(() => {
    if (triggerGetProjectSprintsResponse?.data) {
      setSprints(triggerGetProjectSprintsResponse.data.content)
    }
  }, [triggerGetProjectSprintsResponse])

  // Generate timeline data
  const timelineData = useMemo(() => {
    const today = dayjs()

    // Calculate start and end dates based on selected time range
    let monthsBefore: number
    let monthsAfter: number

    if (timeRange === "6months") {
      monthsBefore = 3
      monthsAfter = 3
    } else {
      // 1year
      monthsBefore = 6
      monthsAfter = 6
    }

    const startDate = today.subtract(monthsBefore, "month").startOf("month")
    const endDate = today.add(monthsAfter, "month").endOf("month")

    const days = []
    let currentDay = startDate.clone()

    while (currentDay.isBefore(endDate) || currentDay.isSame(endDate, "day")) {
      days.push({
        date: currentDay.format("YYYY-MM-DD"),
        dayOfWeek: currentDay.format("ddd").charAt(0),
        dayOfMonth: currentDay.date(),
        month: currentDay.format("MMM").toUpperCase(),
        year: currentDay.year(),
        isFirstOfMonth: currentDay.date() === 1,
        isToday: currentDay.isSame(today, "day"),
        isWeekend: currentDay.day() === 0 || currentDay.day() === 6, // 0 is Sunday, 6 is Saturday
      })
      currentDay = currentDay.add(1, "day")
    }

    // Group by month for header
    const monthGroups = days.reduce(
      (acc, day) => {
        const key = `${day.month} ${day.year}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(day)
        return acc
      },
      {} as Record<string, typeof days>,
    )

    return { days, monthGroups, startDate, endDate }
  }, [timeRange])

  // Calculate sprint positions
  useEffect(() => {
    const positions: Record<string, SprintPosition> = {}

    filteredSprints.forEach((sprint, index) => {
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
          positions[sprint.id] = {
            id: sprint.id,
            x: startIndex * GRID_SIZE,
            y: index * ROW_HEIGHT + 10,
            width: (endIndex - startIndex + 1) * GRID_SIZE,
            height: SPRINT_HEIGHT,
          }
        }
      }
    })

    setSprintPositions(positions)
  }, [sprints, timelineData, GRID_SIZE])

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

  const handleSprintUpdate = async (sprintId: string, newStartDate: string, newEndDate: string) => {
    try {
      await triggerEditSprintGoalAndDates({
        sprintId,
        startDate: dayjs(newStartDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
        endDate: dayjs(newEndDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
      })

      setSprints((prev) =>
        prev.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, startDate: newStartDate, endDate: newEndDate } : sprint,
        ),
      )
    } catch (error) {
      console.error("Failed to update sprint:", error)
    }
  }

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Filter sprints
  const filteredSprints = useMemo(
    () =>
      sprints.filter((sprint) => {
        const matchesSearch =
          sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sprint.sprintGoal?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus =
          statusFilter.length === 0 || statusFilter.includes(sprint.status)

        return matchesSearch && matchesStatus
      }),
    [sprints, searchTerm, statusFilter]
  )

  // Scroll to today when timeline data changes
  useEffect(() => {
    if (timelineScrollRef.current) {
      const todayIndex = timelineData.days.findIndex((day) => day.isToday)
      if (todayIndex !== -1) {
        const scrollPosition = todayIndex * GRID_SIZE - timelineScrollRef.current.clientWidth / 2
        timelineScrollRef.current.scrollLeft = Math.max(0, scrollPosition)
      }
    }
  }, [timelineData.days, GRID_SIZE])

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
          </div>
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Status
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
                        : [...prev, status as SprintStatus]
                    )
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      readOnly
                      checked={statusFilter.includes(status as SprintStatus)}
                    />
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                {timeRange === "6months" ? "6 Months" : "1 Year"} View
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleTimeRangeChange("6months")}>6 Months</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTimeRangeChange("1year")}>1 Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {(statusFilter.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center py-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
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
        </div>
      )}
      {/* Timeline Header */}
      <div className="flex flex-col border-b bg-gray-50 flex-shrink-0">
        {/* Month Names Row */}
        <div className="flex">
          <div className="w-48 p-3 border-r bg-white flex-shrink-0">
            <span className="text-sm font-medium text-gray-600">Sprint</span>
          </div>
          <div
            ref={headerScrollRef}
            className="flex overflow-x-hidden flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex" style={{ width: `${timelineData.days.length * GRID_SIZE}px` }}>
              {Object.entries(timelineData.monthGroups).map(([monthYear, days]) => (
                <div
                  key={monthYear}
                  className="flex items-center justify-center border-r bg-gray-100 flex-shrink-0 h-full"
                  style={{ width: `${days.length * GRID_SIZE}px` }}
                >
                  <span className="text-sm font-medium text-gray-700">{monthYear}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Dates Row - Only show if not expanded */}
        {!isExpanded && (
          <div className="flex">
            <div className="w-48 border-r bg-white flex-shrink-0" style={{ height: "40px" }} />
            <div
              ref={dailyScrollRef}
              className="flex overflow-x-hidden flex-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex" style={{ width: `${timelineData.days.length * GRID_SIZE}px` }}>
                {timelineData.days.map((day) => (
                  <div
                    key={day.date}
                    className={`flex flex-col items-center justify-center border flex-shrink-0 ${day.isToday
                      ? "bg-blue-50 border-blue-300"
                      : day.isWeekend
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-gray-200"
                      }`}
                    style={{ width: `${GRID_SIZE}px`, height: "40px" }}
                  >
                    <span className="text-xs text-gray-500 font-medium">{day.dayOfWeek}</span>
                    <span className={`text-xs ${day.isToday ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                      {day.dayOfMonth}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Timeline Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sprint Names Sidebar */}
        <div className="w-48 border-r bg-white flex-shrink-0 overflow-y-auto">
          {filteredSprints.map((sprint) => (
            <div key={sprint.id} className="p-3 border-b flex items-center" style={{ height: `${ROW_HEIGHT}px` }}>
              <div className="text-sm font-medium truncate">{sprint.name}</div>
            </div>
          ))}
        </div>

        {/* Timeline Grid */}
        <div ref={timelineScrollRef} className="flex-1 overflow-auto" onScroll={handleTimelineScroll}>
          <div
            className="relative bg-white"
            style={{
              width: `${timelineData.days.length * GRID_SIZE}px`,
              height: `${filteredSprints.length * ROW_HEIGHT}px`,
              minHeight: "400px",
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

              const currentEndDate = activeDragSprint?.id === sprint.id ? activeDragSprint.endDate : sprint.endDate

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

                    <div className="flex-1 p-2">
                      <div className="text-xs font-medium mb-1">{sprint.name}</div>
                      <div className="flex items-center justify-between ">
                        <div className="text-xs text-gray-500">
                          <p className="truncate text-xs">
                            {extendsLeft ? "←" : ""} {dayjs(currentStartDate).format("MMM D")} -{" "}
                            {dayjs(currentEndDate).format("MMM D")} {extendsRight ? "→" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Rnd>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineTab
