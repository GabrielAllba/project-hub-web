"use client"

import { useCompleteSprint } from "@/shared/hooks/use-complete-sprint"
import { useGetCompleteSprintInfo } from "@/shared/hooks/use-get-complete-sprint-info"
import { BadgeCheck, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface CompleteSprintModalProps {
    sprintId: string
    sprintName: string
    availableSprints: { id: string; name: string }[]
    onCompleteSprint: (moveToSprintId: string | null) => void
}

export function CompleteSprintModal({
    sprintId,
    sprintName,
    availableSprints,
    onCompleteSprint,
}: CompleteSprintModalProps) {
    const [moveToSprintId, setMoveToSprintId] = useState<string | null>(
        availableSprints.length > 0 ? availableSprints[0].id : null
    )
    const [open, setOpen] = useState(false)

    const { triggerCompleteSprint } = useCompleteSprint(sprintId || "")
    const { triggerGetCompleteSprintInfo } = useGetCompleteSprintInfo(sprintId || "")

    const [completedCount, setCompletedCount] = useState<number>() 
    const [openCount, setOpenCount] = useState<number>() 

    useEffect(() => {
        triggerGetCompleteSprintInfo().then((res) => {
            setCompletedCount(res.data.doneBacklogs)
            setOpenCount(res.data.notDoneBacklogs)
        })
    } , [open])

    const handleComplete = async () => {
        await triggerCompleteSprint()
        onCompleteSprint(moveToSprintId === "backlog" ? null : moveToSprintId)
        setOpen(false)
        toast.success("Sprint completed successfully")
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
                        <strong>{completedCount} completed work item{completedCount !== 1 ? "s" : ""}</strong>{" "}
                        and <strong>{openCount} open work item{openCount !== 1 ? "s" : ""}</strong>.
                    </p>
                    <ul className="list-disc list-inside text-gray-600">
                        <li>
                            Completed work items includes everything on this sprint, <strong>Done</strong>.
                        </li>
                        <li>
                            Open work items includes everything from any <strong>other than Done</strong> work items on this sprint.
                            Move these to the backlog.
                        </li>
                    </ul>

                    <div>
                        <label htmlFor="move-to" className="block text-sm font-medium mb-1">
                            Move open work items to
                        </label>
                        <Select
                            value={moveToSprintId || ""}
                            onValueChange={(value) => setMoveToSprintId(value)}
                        >
                            <SelectTrigger id="move-to" className="w-full">
                                <SelectValue placeholder="Select sprint or backlog" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSprints.map((s) => (
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
