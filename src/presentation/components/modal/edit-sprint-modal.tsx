"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import { CalendarIcon, Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { Sprint } from "@/domain/entities/sprint"
import { useEditSprintGoalAndDates } from "@/shared/hooks/use-edit-sprint-goal-and-dates"
import { cn } from "@/shared/utils/merge-class"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import {
    PopoverDialog,
    PopoverDialogContent,
    PopoverDialogTrigger,
} from "../ui/popover-dialog"
import type { BaseResponse } from "@/domain/dto/base-response"

const sprintSchema = z.object({
    goal: z.string().min(0, "Sprint goal is required"),
    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
})

type SprintFormValues = z.infer<typeof sprintSchema>

interface EditSprintModalProps {
    sprint: Sprint
    onEditSprint: (sprintId: string) => void
}

export function EditSprintModal({ sprint, onEditSprint }: EditSprintModalProps) {
    const { triggerEditSprintGoalAndDates } = useEditSprintGoalAndDates()

    const [open, setOpen] = useState(false)

    const initialValues = {
        goal: sprint.sprintGoal || "",
        startDate: sprint.startDate ? new Date(sprint.startDate) : null,
        endDate: sprint.endDate ? new Date(sprint.endDate) : null,
    }

    const form = useForm<SprintFormValues>({
        resolver: zodResolver(sprintSchema),
        defaultValues: initialValues,
    })

    const watchGoal = form.watch("goal")
    const watchStartDate = form.watch("startDate")
    const watchEndDate = form.watch("endDate")

    const hasChanges =
        watchGoal !== initialValues.goal ||
        watchStartDate?.toISOString() !== initialValues.startDate?.toISOString() ||
        watchEndDate?.toISOString() !== initialValues.endDate?.toISOString()

    const onSubmit = async (data: SprintFormValues) => {
        const { startDate, endDate, goal } = data

        const start = startDate ? dayjs(startDate) : null
        const end = endDate ? dayjs(endDate) : null

        if (start && end && start.isAfter(end)) {
            toast.error("Start date cannot be after end date.")
            return
        }

        try {
            await triggerEditSprintGoalAndDates({
                sprintId: sprint.id,
                sprintGoal: goal?.trim() ?? null,
                startDate: start ? start.format("YYYY-MM-DD HH:mm:ss.SSS") : null,
                endDate: end ? end.format("YYYY-MM-DD HH:mm:ss.SSS") : null,
            })

            toast.success("Sprint updated successfully!")
            onEditSprint(sprint.id)
            setOpen(false)
        } catch (err) {
            const baseError = err as BaseResponse<null>
            toast.error("Failed to update sprint. " + baseError.message)

            // rollback form to original state
            form.reset(initialValues)
        }

    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="hover:bg-gray-200 p-1 rounded-sm hover:cursor-pointer">
                    <Pencil className="size-3 text-gray-700" />
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Sprint</DialogTitle>
                    <DialogDescription>Update sprint goal and dates below.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                        {/* GOAL */}
                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sprint Goal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter sprint goal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* START DATE */}
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                    <PopoverDialog>
                                        <PopoverDialogTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "pl-3 w-full text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? dayjs(field.value).format("MMM D, YYYY")
                                                        : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverDialogTrigger>
                                        <PopoverDialogContent className="w-auto p-0 z-50" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value!}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverDialogContent>
                                    </PopoverDialog>
                                    <FormDescription>Start of the sprint.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* END DATE */}
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                    <PopoverDialog>
                                        <PopoverDialogTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "pl-3 w-full text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? dayjs(field.value).format("MMM D, YYYY")
                                                        : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverDialogTrigger>
                                        <PopoverDialogContent className="flex w-auto p-0 z-50" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value!}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverDialogContent>
                                    </PopoverDialog>
                                    <FormDescription>End of the sprint.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full mt-4" disabled={!hasChanges}>
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
