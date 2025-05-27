"use client"
import { PRIORITY_FILTERS, STATUS_FILTERS } from "@/constants/product-backlog-constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

interface ProductBacklogFiltersProps {
    priorityFilter: string
    statusFilter: string
    onPriorityChange: (value: string) => void
    onStatusChange: (value: string) => void
}

export const ProductBacklogFilters = ({
    priorityFilter,
    statusFilter,
    onPriorityChange,
    onStatusChange,
}: ProductBacklogFiltersProps) => {
    return (
        <div className="flex gap-4">
            <div className="w-1/2">
                <Select value={priorityFilter} onValueChange={onPriorityChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter Prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRIORITY_FILTERS.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value}>
                                {filter.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-1/2">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_FILTERS.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value}>
                                {filter.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
