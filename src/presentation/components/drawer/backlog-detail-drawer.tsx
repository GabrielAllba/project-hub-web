"use client"

import {
  History,
  Link as LinkIcon,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";
import { Button } from "@/presentation/components/ui/button";
import { Drawer, DrawerContent } from "@/presentation/components/ui/drawer";
import { Input } from "@/presentation/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select";
import { Separator } from "@/presentation/components/ui/separator";
import { Tabs, TabsContent } from "@/presentation/components/ui/tabs";
import { useGetProductBacklogById } from "@/shared/hooks/use-get-product-backlog-by-id";
import { LoadingSpinner } from "../loading/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import { useBacklog } from "@/shared/contexts/backlog-context";
import { useProductGoals } from "@/shared/contexts/product-goals-context";
import { useSprint } from "@/shared/contexts/sprint-context";
import { toast } from "sonner";

interface ActivityLogItemProps {
  id: string;
  userId: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  activityType: 'title_change' | 'status_change' | 'priority_change' | 'point_change' | 'goal_change' | 'comment_added';
  description: string;
  createdAt: string;
  oldValue?: string | number | null;
  newValue?: string | number | null;
}

interface ProductBacklogWithActivityLogs {
  id: string;
  title: string;
  status: ProductBacklogStatus;
  priority: ProductBacklogPriority;
  point: number;
  productGoalId: string | null;
  sprintId: string | null;
  activityLogs?: ActivityLogItemProps[];
}


function EditableText({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(value)

  return editing ? (
    <Input
      value={temp}
      autoFocus
      onChange={(e) => setTemp(e.target.value)}
      onBlur={() => {
        onChange(temp)
        setEditing(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange(temp)
          setEditing(false)
        }
        if (e.key === "Escape") {
          setTemp(value)
          setEditing(false)
        }
      }}
      className={`h-8 text-sm focus-visible:ring-offset-0 focus-visible:ring-indigo-500 ${className}`}
    />
  ) : (
    <h2
      className={`text-2xl font-bold cursor-pointer hover:underline text-gray-800 ${className}`}
      onClick={() => setEditing(true)}
    >
      {value || placeholder || "Untitled Backlog"}
    </h2>
  )
}


export function BacklogDetailDrawer() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const backlogId = searchParams.get("backlogId")

  const [open, setOpen] = useState(false)
  const [data, setData] = useState<ProductBacklogWithActivityLogs | null>(null)

  const { editBacklogTitle: editUnassignedBacklogTitle,
    editBacklogPoint: editUnassignedBacklogPoint,
    editBacklogPriority: editUnassignedBacklogPriority,
    editBacklogStatus: editUnassignedBacklogStatus,
    editBacklogGoal: editUnassignedBacklogGoal,
  } = useBacklog()

  const { editBacklogTitle: editSprintBacklogTitle,
    editBacklogPoint: editSprintBacklogPoint,
    editBacklogPriority: editSprintBacklogPriority,
    editBacklogStatus: editSprintBacklogStatus,
    editBacklogGoal: editSprintBacklogGoal,
  } = useSprint()

  const { goals } = useProductGoals()

  const { triggerGetProductBacklogById, triggerGetProductBacklogByIdLoading } =
    useGetProductBacklogById(backlogId ?? "")

  const isSprintBacklog = useMemo(() => data?.sprintId !== null, [data]);

  useEffect(() => {
    if (backlogId) {
      setOpen(true)
      triggerGetProductBacklogById(backlogId)
        .then((res) => {
          if (res.status === "success" && res.data) {
            setData(res.data)

            setData(prev => ({
              ...prev!,
              activityLogs: [
                {
                  id: "act1",
                  userId: "user1",
                  user: { name: "Olivier Giroud", avatarUrl: "https://i.ibb.co/L8G7716/Olivier-Giroud.jpg" },
                  activityType: "comment_added",
                  description: "added a comment: 'This task is crucial for ensuring the successful deployment of the new software version. It is essential to conduct thorough testing to identify and address any issues before the release.'",
                  createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString()
                },
                {
                  id: "act2",
                  userId: "user2",
                  user: { name: "Alice Johnson", avatarUrl: "https://github.com/shadcn.png" },
                  activityType: "status_change",
                  description: "changed status from 'TODO' to 'INPROGRESS'",
                  oldValue: "TODO",
                  newValue: "INPROGRESS",
                  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: "act3",
                  userId: "user1",
                  user: { name: "Olivier Giroud", avatarUrl: "https://i.ibb.co/L8G7716/Olivier-Giroud.jpg" },
                  activityType: "point_change",
                  description: "updated point from 3 to 5",
                  oldValue: 3,
                  newValue: 5,
                  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: "act4",
                  userId: "user3",
                  user: { name: "Robert Downey", avatarUrl: "https://i.pravatar.cc/150?img=68" },
                  activityType: "priority_change",
                  description: "set priority to 'HIGH'",
                  oldValue: "MEDIUM",
                  newValue: "HIGH",
                  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                }
              ]
            }));

          } else {
            setData(null)
            toast.error("Failed to load backlog details: " + (res.message || "Unknown error"))
          }
        })
        .catch((err) => {
          console.error("Error fetching backlog:", err);
          toast.error("An unexpected error occurred while fetching backlog details.");
          setData(null);
        })
    } else {
      setOpen(false)
      setData(null)
    }
  }, [backlogId])

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("backlogId")
    navigate({ search: newParams.toString() }, { replace: true })
  }


  const handleTitleChange = useCallback(async (newTitle: string) => {
    if (!data || newTitle === data.title) return;
    const originalTitle = data.title;
    setData(prev => prev ? { ...prev, title: newTitle } : null);
    try {
      if (isSprintBacklog && data.sprintId) {
        await editSprintBacklogTitle(data.sprintId, data.id, newTitle);
      } else {
        await editUnassignedBacklogTitle(data.id, newTitle);
      }
      toast.success("Title updated!");

    } catch (error) {
      toast.error("Failed to update title: " + (error instanceof Error ? error.message : String(error)));
      setData(prev => prev ? { ...prev, title: originalTitle } : null);
    }
  }, [data, isSprintBacklog, editSprintBacklogTitle, editUnassignedBacklogTitle]);


  const handleStatusChange = useCallback(async (newStatus: ProductBacklogStatus) => {
    if (!data || newStatus === data.status) return;
    const originalStatus = data.status;
    setData(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      if (isSprintBacklog && data.sprintId) {
        await editSprintBacklogStatus(data.sprintId, data.id, newStatus);
      } else {
        await editUnassignedBacklogStatus(data.id, newStatus);
      }
      toast.success("Status updated!");

    } catch (error) {
      toast.error("Failed to update status: " + (error instanceof Error ? error.message : String(error)));
      setData(prev => prev ? { ...prev, status: originalStatus } : null);
    }
  }, [data, isSprintBacklog, editSprintBacklogStatus, editUnassignedBacklogStatus]);


  const handlePriorityChange = useCallback(async (newPriority: ProductBacklogPriority) => {
    if (!data || newPriority === data.priority) return;
    const originalPriority = data.priority;
    setData(prev => prev ? { ...prev, priority: newPriority } : null);
    try {
      if (isSprintBacklog && data.sprintId) {
        await editSprintBacklogPriority(data.sprintId, data.id, newPriority);
      } else {
        await editUnassignedBacklogPriority(data.id, newPriority);
      }
      toast.success("Priority updated!");

    } catch (error) {
      toast.error("Failed to update priority: " + (error instanceof Error ? error.message : String(error)));
      setData(prev => prev ? { ...prev, priority: originalPriority } : null);
    }
  }, [data, isSprintBacklog, editSprintBacklogPriority, editUnassignedBacklogPriority]);


  const handlePointChange = useCallback(async (val: string) => {
    if (!data) return;
    const num = parseInt(val);
    if (isNaN(num) || num === data.point) return;
    const originalPoint = data.point;

    setData(prev => prev ? { ...prev, point: num } : null);
    try {
      if (isSprintBacklog && data.sprintId) {
        await editSprintBacklogPoint(data.sprintId, data.id, num);
      } else {
        await editUnassignedBacklogPoint(data.id, num);
      }
      toast.success("Point updated!");

    } catch (error) {
      toast.error("Failed to update point: " + (error instanceof Error ? error.message : String(error)));
      setData(prev => prev ? { ...prev, point: originalPoint } : null);
    }
  }, [data, isSprintBacklog, editSprintBacklogPoint, editUnassignedBacklogPoint]);


  const handleProductGoalChange = useCallback(async (newGoalId: string) => {
    if (!data || newGoalId === (data.productGoalId || "")) return;
    const updatedGoalId = newGoalId === "none" ? null : newGoalId;
    const originalGoalId = data.productGoalId;

    setData(prev => prev ? { ...prev, productGoalId: updatedGoalId } : null);
    try {
      if (isSprintBacklog && data.sprintId) {
        await editSprintBacklogGoal(data.sprintId, data.id, updatedGoalId);
      } else {
        await editUnassignedBacklogGoal(data.id, updatedGoalId);
      }
      toast.success("Product goal updated!");

    } catch (error) {
      toast.error("Failed to update product goal: " + (error instanceof Error ? error.message : String(error)));
      setData(prev => prev ? { ...prev, productGoalId: originalGoalId } : null);
    }
  }, [data, isSprintBacklog, editSprintBacklogGoal, editUnassignedBacklogGoal]);




  const getProductGoalName = useCallback((goalId: string | null) => {
    if (!goalId) return "No Goal";
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.title : "Unknown Goal";
  }, [goals]);


  const formatActivityTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;


    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <Drawer open={open} onClose={handleClose} direction="right" shouldScaleBackground={false}>
      <DrawerContent className="ml-auto w-full max-w-xl h-full rounded-none  shadow-xl bg-white flex flex-col border-none border-0">
        {/* Header with Close Button and Link */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <LinkIcon className="h-3 w-3" />
            Copy Link
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Loading State */}
        {triggerGetProductBacklogByIdLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner message="Memuat backlog..." />
          </div>
        ) : data ? (
          <div className="p-8 space-y-6 overflow-auto flex-1">
            {/* Title */}
            <EditableText
              value={data.title}
              onChange={handleTitleChange}
              placeholder="Judul backlog"
              className="text-2xl font-bold -ml-2"
            />

            {/* Main Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700 mt-4">
              {/* STATUS */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <Select
                  value={data.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="h-9 w-full max-w-[200px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="INPROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PRIORITY */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Prioritas</span>
                <Select
                  value={data.priority}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger className="h-9 w-full max-w-[200px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* POINT */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Poin</span>
                <EditableText
                  value={data.point?.toString() ?? ""}
                  onChange={handlePointChange}
                  placeholder="0"
                  className="w-full max-w-[200px] h-9"
                />
              </div>

              {/* PRODUCT GOAL */}
              <div className="space-y-1 col-span-2">
                <span className="text-sm font-medium text-gray-500">Product Goal</span>
                <Select
                  value={data.productGoalId || "none"}
                  onValueChange={handleProductGoalChange}
                >
                  <SelectTrigger className="h-9 w-full max-w-[200px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue>
                      {getProductGoalName(data.productGoalId)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada Goal</SelectItem>
                    {goals.map(goal => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6 border-gray-200" />

            {/* Header for Activity Log section */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-700">
                <History className="h-4 w-4 text-gray-500" /> 
                Activity ({data.activityLogs?.length || 0}) 
              </div>
            </div>


            <Tabs defaultValue="activity" className="w-full"> {/* Changed default value to "activity" */}
        
              <TabsContent value="activity" className="mt-4 space-y-4">
                {/* List of Activity Logs */}
                {data.activityLogs && data.activityLogs.length > 0 ? (
                  <div className="space-y-5">
                    {data.activityLogs.map((activity, index) => (
                      <div key={activity.id || `activity-${index}`} className="flex gap-3 items-start">
                        <Avatar className="h-8 w-8 flex-shrink-0 border border-gray-100">
                          <AvatarImage src={activity.user.avatarUrl} alt={activity.user.name} />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm">
                          <p className="text-gray-900 leading-tight">
                            <span className="font-semibold">{activity.user.name}</span>{" "}
                            <span className="text-gray-700">{activity.description}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatActivityTime(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Tidak ada aktivitas terbaru.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10 flex-1 flex items-center justify-center flex-col">
            <p className="mb-2 text-lg">Detail backlog tidak ditemukan.</p>
            <p className="text-sm">Silakan pilih backlog lain atau coba muat ulang.</p>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}