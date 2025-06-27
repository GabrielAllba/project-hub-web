"use client"

import { Check } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import type { ProjectRole } from "@/constants/constants"
import type { User } from "@/domain/entities/user"
import { useGetProjectMembers } from "@/shared/hooks/use-get-project-members"

import { Avatar, AvatarFallback } from "@/presentation/components/ui/avatar"
import { Input } from "@/presentation/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/presentation/components/ui/popover"
import { ScrollArea } from "@/presentation/components/ui/scroll-area"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

type Props = {
    projectId: string
    selectedAssignee: User | null
    onSelectAssignee: (user: User) => void
}

const roles: ProjectRole[] = ["PRODUCT_OWNER", "SCRUM_MASTER", "DEVELOPER"]

export function AssigneeSelector({
    projectId,
    selectedAssignee,
    onSelectAssignee,
}: Props) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [members, setMembers] = useState<User[]>([])

    const { triggerGetProjectMembers } = useGetProjectMembers(projectId)

    useEffect(() => {
        const fetchAllMembers = async () => {
            const results = await Promise.all(
                roles.map((role) => triggerGetProjectMembers(role))
            )

            const allUsers: User[] = results
                .filter((res) => res.status === "success" && res.data)
                .flatMap((res) =>
                    res.data!.map((member) => ({
                        ...member,
                        isEmailVerified: false,
                        isUserFirstTime: false,
                    }))
                )

            setMembers(allUsers)
        }

        fetchAllMembers()
    }, [projectId])

    const filtered = useMemo(() => {
        const q = query.toLowerCase()
        return query
            ? members.filter(
                (user) =>
                    user.username.toLowerCase().includes(q) ||
                    user.email.toLowerCase().includes(q)
            )
            : members
    }, [query, members])

    return (
        <TooltipProvider>
            <Popover open={open} onOpenChange={setOpen}>
                <Tooltip>
                    <PopoverTrigger asChild>
                        <div>
                            <TooltipTrigger asChild>
                                {selectedAssignee ? (
                                    <Avatar className="cursor-pointer h-6 w-6 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        <AvatarFallback
                                            className={cn("text-[9px] font-semibold text-white bg-gradient-to-br", getGradientForUser(selectedAssignee.username.charAt(0).toUpperCase()))}
                                        >
                                            {getUserInitials(selectedAssignee.username.charAt(0).toUpperCase())}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <LoadingSpinner size="sm" className="text-blue-600" />
                                )}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                                {selectedAssignee?.email ?? "No assignee"}
                            </TooltipContent>
                        </div>
                    </PopoverTrigger>
                </Tooltip>

                <PopoverContent className="w-64 p-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or email"
                        className="mb-2 h-8 text-sm"
                    />
                    <ScrollArea className="h-60">
                        <div className="space-y-1">
                            {filtered.map((user) => {
                                const isSelected = user.id === selectedAssignee?.id
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => {
                                            onSelectAssignee(user)
                                            setOpen(false)
                                        }}
                                        className={cn(
                                            "flex items-center justify-between gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-muted",
                                            isSelected && "bg-muted"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="cursor-pointer h-6 w-6 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                <AvatarFallback
                                                    className={cn("text-[8px] font-semibold text-white bg-gradient-to-br", getGradientForUser(user.username.charAt(0).toUpperCase()))}
                                                >
                                                    {getUserInitials(user.username.charAt(0).toUpperCase())}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium">{user.username}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    )
}
