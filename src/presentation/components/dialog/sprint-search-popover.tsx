"use client"

import type { Sprint } from "@/domain/entities/sprint"

import { DEFAULT_PAGE_SIZE } from "@/constants/constants"; // <- pastikan kamu punya ini
import { useDebounce } from "@/shared/hooks/use-debounce"
import { useSearchSprints } from "@/shared/hooks/use-search-sprint"
import { getSprintStatusColor, getSprintStatusLabel } from "@/shared/utils/sprint-utils"
import { Calendar, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface SprintSearchPopoverProps {
    projectId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    selectedSprint: Sprint | null
    onSprintSelect: (sprint: Sprint) => void
}

export const SprintSearchPopover = ({
    projectId,
    isOpen,
    onOpenChange,
    searchQuery,
    onSearchChange,
    selectedSprint,
    onSprintSelect,
}: SprintSearchPopoverProps) => {
    const { triggerSearchSprints, searchSprintsResponse, searchSprintsLoading } = useSearchSprints(projectId)

    const debouncedQuery = useDebounce(searchQuery, 400)
    const [page, setPage] = useState(0)
    const [accumulatedSprints, setAccumulatedSprints] = useState<Sprint[]>([])

    const totalPages = searchSprintsResponse?.data?.totalPages ?? 0

    useEffect(() => {
        if (debouncedQuery.trim() !== "") {
            setPage(0)
            triggerSearchSprints(debouncedQuery, 0, DEFAULT_PAGE_SIZE).then((res) => {
                setAccumulatedSprints(res?.data?.content ?? [])
            })
        } else {
            setAccumulatedSprints([])
        }
    }, [debouncedQuery])

    const handleLoadMore = async () => {
        const nextPage = page + 1
        const res = await triggerSearchSprints(debouncedQuery, nextPage, DEFAULT_PAGE_SIZE)
        const newSprints = res?.data?.content ?? []
        setAccumulatedSprints((prev) => [...prev, ...newSprints])
        setPage(nextPage)
    }

    return (
        <Card className="rounded-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Select Sprint 
                </CardTitle>
                <CardDescription>
                    Search and select a sprint to view the detail.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Popover open={isOpen} onOpenChange={onOpenChange}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal rounded-sm">
                            <Search className="w-4 h-4 mr-2" />
                            {selectedSprint ? selectedSprint.name : "Search for a sprint..."}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-0 rounded-sm" align="start">
                        <div className="p-4 border-b">
                            <h4 className="font-medium">Select Sprint</h4>
                            <p className="text-sm text-muted-foreground">
                                Search through recent sprints to generate a report.
                            </p>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search sprints..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-10 rounded-sm"
                                />
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Search Results</h4>
                                {accumulatedSprints.length > 0 ? (
                                    <>
                                        {accumulatedSprints.map((sprint) => (
                                            <div
                                                key={sprint.id}
                                                className="flex items-center justify-between p-3 border rounded-sm hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => onSprintSelect(sprint)}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h5 className="font-medium">{sprint.name}</h5>
                                                        <Badge
                                                            variant="outline"
                                                            className={`${getSprintStatusColor(sprint.status)} rounded-sm`}
                                                        >
                                                            {getSprintStatusLabel(sprint.status)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                                                            {new Date(sprint.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {sprint.sprintGoal && (
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                            {sprint.sprintGoal}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {page + 1 < totalPages && (
                                            <div className="flex justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleLoadMore}
                                                    disabled={searchSprintsLoading}
                                                    className="mt-2"
                                                >
                                                    {searchSprintsLoading ? "Loading..." : "Load More"}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>
                                            {searchSprintsLoading ? "Loading sprints..." : "No sprints found matching your search."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    )
}
