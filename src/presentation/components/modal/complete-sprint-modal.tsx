"use client"

import { useSprint } from "@/shared/contexts/sprint-context"
import { BadgeCheck, Trophy } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface CompleteSprintModalProps {
  sprintId: string
}

export function CompleteSprintModal({ sprintId }: CompleteSprintModalProps) {
  const [open, setOpen] = useState(false)
  const [completedCount, setCompletedCount] = useState<number>(0)
  const [openCount, setOpenCount] = useState<number>(0)
  const [moveToSprintId, setMoveToSprintId] = useState<string>("backlog")

  const navigate = useNavigate()


  const { sprints, completeSprint, getCompleteSprintInfo } = useSprint()

  const sprintName = useMemo(() => {
    const sprint = sprints.find((s) => s.id === sprintId)
    return sprint?.name ?? "Sprint"
  }, [sprints, sprintId])

  useEffect(() => {
    if (!open) return
    getCompleteSprintInfo(sprintId)
      .then((res) => {
        setCompletedCount(res.data.doneBacklogs)
        setOpenCount(res.data.notDoneBacklogs)
        setMoveToSprintId("backlog")
      })
      .catch(() => {
        toast.error("Failed to load sprint completion info.")
      })
  }, [open, sprintId, getCompleteSprintInfo])

  const handleComplete = async () => {
    try {
      const res = await completeSprint(sprintId)
      if (res.status == "success" && res.data) {
        setOpen(false)
        navigate(`/dashboard/project/${res.data.projectId}?tab=report&sprintId=${res.data.id}`, { replace: true })
      }
    } catch (err) {
      toast.error("Unexpected error: " + err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs">
          Complete Sprint
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center">
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
          <DialogTitle className="text-xl font-bold mt-2">
            Complete {sprintName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-gray-700">
          <p>
            This sprint contains{" "}
            <strong>
              {completedCount} completed work item{completedCount !== 1 ? "s" : ""}
            </strong>{" "}
            and{" "}
            <strong>
              {openCount} open work item{openCount !== 1 ? "s" : ""}
            </strong>
            .
          </p>
          <ul className="list-disc list-inside text-gray-600">
            <li>
              Completed work items include all items with status <strong>Done</strong>.
            </li>
            <li>
              Open work items are items <strong>not marked as Done</strong>. You can move them to product backlogs.
            </li>
          </ul>

          <div>
            <label htmlFor="move-to" className="block text-sm font-medium mb-1">
              Move open work items to
            </label>
            <Select
              value={moveToSprintId}
              onValueChange={(value) => setMoveToSprintId(value)}
            >
              <SelectTrigger id="move-to" className="w-full">
                <SelectValue placeholder="Select sprint or backlog" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog</SelectItem>
                {sprints
                  .filter((s) => s.id !== sprintId)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete}>
            <BadgeCheck className="w-4 h-4 mr-2" />
            Complete sprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
