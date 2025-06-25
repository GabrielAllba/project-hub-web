import { IconFolder, IconHammerOff, IconUserOff } from "@tabler/icons-react"
import { Calendar, Filter, ListTodo, LogsIcon, SearchX } from "lucide-react"

type EmptyStateProps = {
    type: "no-sprints" | "no-search" | "no-filter" | "no-task" | "no-work-items" | "no-member" | "no-project" | "no-activity"
    size?: "sm"
}

export const EmptyStateIllustration = ({ type, size = "sm" }: EmptyStateProps) => {
    const sizeClasses = {
        sm: {
            iconPadding: "p-2",
            icon: "w-10 h-10",
            heading: "text-base",
            text: "text-sm",
        },
    }[size]


    const render = (
        icon: React.ReactNode,
        heading: string,
        text: string,
        bgColor: string
    ) => (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="mb-6 relative">
                    <div
                        className={`mx-auto ${sizeClasses.icon} aspect-square rounded-full flex items-center justify-center ${sizeClasses.iconPadding} ${bgColor}`}
                    >
                        {icon}
                    </div>
                </div>
                <h3 className={`${sizeClasses.heading} font-semibold text-gray-900 mb-2`}>{heading}</h3>
                <p className={`text-gray-500 mb-4 ${sizeClasses.text}`}>{text}</p>
            </div>
        </div>
    )

    if (type === "no-sprints") {
        return render(
            <Calendar className={`${sizeClasses.icon} text-blue-500`} />,
            "No Sprints Found",
            "we couldn't find any sprints matching your search. Try using different keywords or check your spelling.",
            "bg-gradient-to-br from-blue-100 to-blue-200"
        )
    }

    if (type === "no-search") {
        return render(
            <SearchX className={`${sizeClasses.icon} text-orange-500`} />,
            "No Search Results",
            "We couldn't find any sprints matching your search. Try using different keywords or check your spelling.",
            "bg-gradient-to-br from-orange-100 to-orange-200"
        )
    }

    if (type === "no-filter") {
        return render(
            <Filter className={`${sizeClasses.icon} text-purple-500`} />,
            "No Matching Sprints",
            "No sprints match your current filter criteria. Try adjusting your filters to see more results.",
            "bg-gradient-to-br from-purple-100 to-purple-200"
        )
    }

    if (type === "no-task") {
        return render(
            <ListTodo className={`${sizeClasses.icon} text-blue-600`} />,
            "No Tasks Available",
            "There are currently no tasks. Create tasks to get started with your work.",
            "bg-gradient-to-br from-blue-50 to-blue-100"
        )
    }

    if (type === "no-work-items") {
        return render(
            <IconHammerOff className={`${sizeClasses.icon} text-blue-600`} />,
            "No Work Items Available",
            "There are currently no work items.",
            "bg-gradient-to-br from-blue-50 to-blue-100"
        )
    }
    if (type === "no-member") {
        return render(
            <IconUserOff className={`${sizeClasses.icon} text-blue-600`} />,
            "No member Available",
            "There are currently no member.",
            "bg-gradient-to-br from-blue-50 to-blue-100"
        )
    }

    if (type === "no-project") {
        return render(
            <IconFolder className={`${sizeClasses.icon} text-blue-600`} />,
            "No Project Available",
            "Start your journey by creating your first project. Manage and monitor all your projects in one place.",
            "bg-gradient-to-br from-blue-50 to-blue-100"
        )
    }

    if (type === "no-activity") {
        return render(
            <LogsIcon className={`${sizeClasses.icon} text-blue-600`} />,
            "No Activity Available",
            "There are currently no activity on this backlog. Try changing point, title, assignee, or others to log the activity.",
            "bg-gradient-to-br from-blue-50 to-blue-100"
        )
    }

    return null
}
