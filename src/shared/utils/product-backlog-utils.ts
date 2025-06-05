import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog"

export const getPriorityLabel = (priority: ProductBacklogPriority): string => {
    switch (priority) {
        case "HIGH":
            return "Prioritas Tinggi"
        case "MEDIUM":
            return "Prioritas Tengah"
        case "LOW":
            return "Prioritas Rendah"
        default:
            return priority
    }
}

export const getStatusLabel = (status: ProductBacklogStatus): string => {
    switch (status) {
        case "TODO":
            return "Ditugaskan"
        case "IN_PROGRESS":
            return "Di Proses"
        case "DONE":
            return "Selesai"
        default:
            return status
    }
}

export const getPriorityColor = (priority: ProductBacklogPriority): string => {
    switch (priority) {
        case "HIGH":
            return "bg-red-100 text-red-800"
        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800"
        case "LOW":
            return "bg-green-100 text-green-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

export const getStatusColor = (status: ProductBacklogStatus): string => {
    switch (status) {
        case "IN_PROGRESS":
            return "bg-blue-100 text-blue-800"
        case "TODO":
            return "bg-purple-100 text-purple-800"
        case "DONE":
            return "bg-green-100 text-green-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}
