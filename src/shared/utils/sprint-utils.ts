import type { SprintStatus } from "@/domain/entities/sprint"

export const getSprintStatusColor = (status: SprintStatus): string => {
    switch (status) {
        case "COMPLETED":
            return "bg-green-500"
        case "IN_PROGRESS":
            return "bg-blue-500"
        case "NOT_STARTED":
            return "bg-gray-300"
        default:
            return "bg-gray-300"
    }
}

export const getSprintStatusLabel = (status: SprintStatus): string => {
    switch (status) {
        case "NOT_STARTED":
            return "NOT_STARTED"
        case "IN_PROGRESS":
            return "IN_PROGRESS"
        case "COMPLETED":
            return "COMPLETED"
        default:
            return status
    }
}