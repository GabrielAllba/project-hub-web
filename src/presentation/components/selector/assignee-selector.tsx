"use client"

import type { ProjectRole } from "@/constants/constants"
import type { User } from "@/domain/entities/user"
import { Avatar, AvatarFallback } from "@/presentation/components/ui/avatar"
import { Input } from "@/presentation/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/presentation/components/ui/popover"
import { ScrollArea } from "@/presentation/components/ui/scroll-area"
import { useGetProjectMembers } from "@/shared/hooks/use-get-project-members"
import { cn } from "@/shared/utils/merge-class"
import { Check } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Props = {
    projectId: string
    selectedAssignee: User | null
    onSelectAssignee: (user: User) => void
}

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
        const fetchAllRoles = async () => {
            const roles: ProjectRole[] = ["PRODUCT_OWNER", "SCRUM_MASTER", "DEVELOPER"]
            const all: User[] = []

            for (const role of roles) {
                const res = await triggerGetProjectMembers(role)
                if (res?.data) all.push(...res.data)
            }

            setMembers(all)
        }

        fetchAllRoles()
    }, [projectId])

    const filtered = useMemo(() => {
        if (!query) return members
        return members.filter(
            (user) =>
                user.username.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
        )
    }, [members, query])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Avatar className="h-5 w-5 flex items-center">
                    <AvatarFallback className="text-xs bg-blue-500 text-white cursor-pointer">
                        {selectedAssignee?.username?.charAt(0).toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-2">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className="mb-2 h-8 text-sm"
                />
                <ScrollArea className="max-h-60">
                    <div className="space-y-1">
                        {filtered.map((user) => {
                            const isSelected = user.id === selectedAssignee?.id
                            return (
                                <div
                                    key={user.id}
                                    className={cn(
                                        "flex items-center justify-between gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-muted",
                                        isSelected && "bg-muted"
                                    )}
                                    onClick={() => {
                                        onSelectAssignee(user)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs bg-blue-500 text-white">
                                                {user.username?.charAt(0).toUpperCase() ?? "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col text-sm">
                                            <span className="font-medium">{user.username}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
