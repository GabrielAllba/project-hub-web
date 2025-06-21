import type { SprintStatus } from "@/domain/entities/sprint"

export const getSprintStatusColor = (status: SprintStatus): string => {
    switch (status) {
        case "COMPLETED":
            return "bg-green-100 text-green-800"
        case "IN_PROGRESS":
            return "bg-blue-100 text-blue-800"
        case "NOT_STARTED":
            return "bg-gray-100 text-gray-800"
        default:
            return "bg-gray-100 text-gray-800"
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