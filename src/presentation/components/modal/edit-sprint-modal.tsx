"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, subDays } from "date-fns"
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
import { PopoverDialog, PopoverDialogContent, PopoverDialogTrigger } from "../ui/popover-dialog"

const sprintSchema = z.object({
    goal: z.string().min(0, "Sprint goal is required."),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
})

type SprintFormValues = z.infer<typeof sprintSchema>

interface EditSprintModalProps {
    sprint: Sprint
    onEditSprint: () => void
}

export function EditSprintModal(props: EditSprintModalProps) {
    const { triggerEditSprintGoalAndDates } = useEditSprintGoalAndDates()
    const [open, setOpen] = useState(false)

    const today = subDays(new Date(), 1)

    const form = useForm<SprintFormValues>({
        resolver: zodResolver(sprintSchema),
        defaultValues: {
            goal: props.sprint.sprintGoal || "",
            startDate: props.sprint.startDate ? new Date(props.sprint.startDate) : undefined,
            endDate: props.sprint.endDate ? new Date(props.sprint.endDate) : undefined,
        },
    })

    const onSubmit = async (data: SprintFormValues) => {
        const { startDate, endDate } = data

        if (startDate > endDate) {
            toast.error("Start date cannot be after end date.")
            return
        }

        if (startDate < today || endDate < today) {
            toast.error("Start and end date cannot be before today.")
            return
        }

        // Call mutation
        try {
            await triggerEditSprintGoalAndDates({
                sprintId: props.sprint.id,
                sprintGoal: data.goal,
                startDate: format(startDate, "yyyy-MM-dd HH:mm:ss.SSS"),
                endDate: format(endDate, "yyyy-MM-dd HH:mm:ss.SSS"),
            })
            toast.success("Sprint updated successfully!")
            props.onEditSprint()
            setOpen(false)
        } catch (err) {
            toast.error("Failed to update sprint." + err)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:cursor-pointer ">
                    <Pencil className="size-4 text-gray-600" />
                </Button>
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
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverDialogTrigger>
                                        <PopoverDialogContent className="w-auto p-0 z-50" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < today}
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
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverDialogTrigger>
                                        <PopoverDialogContent className="flex w-auto p-0 z-50" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < today}
                                                initialFocus
                                            />
                                        </PopoverDialogContent>
                                    </PopoverDialog>
                                    <FormDescription>End of the sprint.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full mt-4">
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
