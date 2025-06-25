import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog"

export const getPriorityLabel = (priority: ProductBacklogPriority): string => {
    switch (priority) {
        case "HIGH":
            return "HIGH"
        case "MEDIUM":
            return "MEDIUM"
        case "LOW":
            return "LOW"
        default:
            return priority
    }
}

export const getStatusLabel = (status: ProductBacklogStatus): string => {
    switch (status) {
        case "TODO":
            return "TODO"
        case "INPROGRESS":
            return "INPROGRESS"
        case "DONE":
            return "DONE"
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
        case "INPROGRESS":
            return "bg-blue-100 text-blue-800"
        case "TODO":
            return "bg-purple-100 text-purple-800"
        case "DONE":
            return "bg-green-100 text-green-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

export const getUserInitials = (username: string) => {
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const getGradientForUser = (username: string) => {
    const gradients = [
        "from-blue-500 to-purple-600",
        "from-emerald-500 to-teal-600",
        "from-orange-500 to-red-600",
        "from-purple-500 to-pink-600",
        "from-indigo-500 to-blue-600",
        "from-green-500 to-emerald-600",
        "from-yellow-500 to-orange-600",
        "from-pink-500 to-rose-600",
    ]

    const hash = username.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
    }, 0)

    return gradients[Math.abs(hash) % gradients.length]
}