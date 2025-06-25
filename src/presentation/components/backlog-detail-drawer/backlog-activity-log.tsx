"use client"

import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { IconReorder } from "@tabler/icons-react"
import {
  Activity,
  ArrowUpWideNarrow,
  Clock,
  Edit,
  Gauge,
  Goal,
  History,
  ListChecks,
  PlusCircle,
  UserPlus,
} from "lucide-react"
import { type BacklogActivityLogResponseDTO } from '../../../domain/dto/res/backlog-activity-log-res'
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"


interface BacklogActivityLogProps {
  activityLogs?: BacklogActivityLogResponseDTO[]
  className?: string
}

const getActivityIcon = (type: BacklogActivityLogResponseDTO["activityType"]) => {
  const iconMap = {
    TITLE_CHANGE: Edit,
    STATUS_CHANGE: ListChecks,
    PRIORITY_CHANGE: Gauge,
    POINT_CHANGE: ArrowUpWideNarrow,
    GOAL_CHANGE: Goal,
    ASSIGNEE_CHANGE: UserPlus,
    BACKLOG_CREATED: PlusCircle,
    BACKLOG_REORDERED: IconReorder,
  }

  return iconMap[type] || History
}

const getActivityConfig = (type: BacklogActivityLogResponseDTO["activityType"]) => {
  const configMap = {
    TITLE_CHANGE: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      label: "Title Changed",
    },
    STATUS_CHANGE: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      label: "Status Changed",
    },
    PRIORITY_CHANGE: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      label: "Priority Changed",
    },
    POINT_CHANGE: {
      color: "bg-purple-50 text-purple-700 border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      label: "Points Changed",
    },
    GOAL_CHANGE: {
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      label: "Goal Changed",
    },
    ASSIGNEE_CHANGE: {
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      label: "Assignee Changed",
    },
    BACKLOG_CREATED: {
      color: "bg-slate-50 text-slate-700 border-slate-200",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      label: "Backlog Created",
    },
    BACKLOG_REORDERED: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      label: "Backlog Created",
    },
  }

  return (
    configMap[type] || {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      label: "Activity",
    }
  )
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}


export function BacklogActivityLog({ activityLogs = [], className }: BacklogActivityLogProps) {
  if (activityLogs.length === 0) {
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Activity Yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              All changes and activities for this backlog will be displayed here in real-time
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort activities by date (newest first)
  const sortedLogs = [...activityLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
            <History className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Activity History</h2>
            <p className="text-sm text-slate-500">{activityLogs.length} activities recorded</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium">
          {sortedLogs.length} Total
        </Badge>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {sortedLogs.map((log, index) => {
          const IconComponent = getActivityIcon(log.activityType)
          const config = getActivityConfig(log.activityType)
          const isLast = index === sortedLogs.length - 1

          return (
            <div key={log.id} className="relative group">
              {/* Timeline line */}
              {!isLast && <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />}

              <div className="flex items-start gap-4 py-4 hover:bg-slate-50/50 transition-all duration-200">
                {/* Avatar with icon overlay */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarFallback
                      className={cn("text-sm font-semibold text-white bg-gradient-to-br", getGradientForUser(log.username.charAt(0).toUpperCase()))}
                    >
                      {getUserInitials(log.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center",
                      config.iconBg,
                    )}
                  >
                    <IconComponent className={cn("h-3.5 w-3.5", config.iconColor)} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-slate-900">{log.username}</span>
                    <Badge variant="outline" className={cn("text-xs font-medium px-2.5 py-0.5", config.color)}>
                      {config.label}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">{formatTimeAgo(log.createdAt)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{log.description}</p>

                  {/* Value changes */}
                  {(log.oldValue !== null || log.newValue !== null) && (
                    <div className="bg-slate-50 border border-slate-100 rounded-md px-4 py-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      {log.oldValue !== null && (
                        <span className="font-medium truncate max-w-[120px]">
                          <span className="uppercase text-[10px] text-slate-400 block">Before</span>
                          {String(log.oldValue)}
                        </span>
                      )}

                      {log.oldValue !== null && log.newValue !== null && (
                        <span className="mx-1 text-slate-400 text-xs">→</span>
                      )}

                      {log.newValue !== null && (
                        <span className="font-medium truncate max-w-[120px]">
                          <span className="uppercase text-[10px] text-slate-400 block">After</span>
                          {String(log.newValue)}
                        </span>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}