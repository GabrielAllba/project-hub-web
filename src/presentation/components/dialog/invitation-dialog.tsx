"use client"

import { DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res"
import { Button } from "@/presentation/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/presentation/components/ui/popover"
import { ScrollArea } from "@/presentation/components/ui/scroll-area"
import { Separator } from "@/presentation/components/ui/separator"
import { useProjects } from "@/shared/contexts/project-context"
import { cn } from "@/shared/utils/merge-class"
import { Bell } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

interface Props {
    invitations: InvitationResponseDTO[]
    onAccept: (id: string) => void
    onReject: (id: string) => void
    loading?: boolean
}

export function InvitationDialog({
    invitations,
    onAccept,
    onReject,
}: Props) {
    const [open, setOpen] = useState(false)
    const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE)
    const [hoveredInvitationId, setHoveredInvitationId] = useState<string | null>(null)

    const navigate = useNavigate()
    const { acceptInvitation, rejectInvitation } = useProjects()

    const pendingInvitationsCount = invitations.filter((inv) => inv.status === "PENDING").length

    const sortedInvitations = useMemo(() => {
        return [...invitations].sort((a, b) => {
            if (a.status === "PENDING" && b.status !== "PENDING") return -1
            if (a.status !== "PENDING" && b.status === "PENDING") return 1
            return new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
        })
    }, [invitations])

    const handleLoadMore = () => setVisibleCount((prev) => prev + DEFAULT_PAGE_SIZE)
    const visibleInvitations = sortedInvitations.slice(0, visibleCount)
    const hasMore = visibleCount < sortedInvitations.length

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hidden sm:flex h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {pendingInvitationsCount > 0 && (
                        <span className="text-[9px] bg-blue-500 absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-primary-foreground">
                            {pendingInvitationsCount}
                        </span>
                    )}
                    <span className="sr-only">View Invitations</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[420px] p-0 border shadow-2xl">
                <div className="px-4 py-3 font-semibold text-lg flex items-center justify-between">
                    Invitations
                    {invitations.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                            {invitations.length} total
                        </span>
                    )}
                </div>
                <Separator />

                {invitations.length === 0 ? (
                    <div className="px-4 py-16 text-center text-sm text-muted-foreground">
                        <span className="text-4xl mb-4 block">🎉</span>
                        <p className="font-medium text-base text-foreground">You're all caught up!</p>
                        <p className="text-sm mt-1">No pending invitations at the moment.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-128 px-1 py-2">
                        <div className="space-y-3 px-3 pb-3">
                            {visibleInvitations.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="border border-muted rounded-lg p-3 flex flex-col gap-2 bg-background hover:bg-accent/50 transition-colors"
                                    onMouseEnter={() => setHoveredInvitationId(inv.id)}
                                    onMouseLeave={() => setHoveredInvitationId(null)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col flex-grow">
                                            <div className="text-sm text-foreground">
                                                <span className="font-medium">{inv.inviterUsername}</span> invited you to
                                                join <span className="font-medium">{inv.projectName}</span> as a{" "}
                                                <span className="font-medium">{inv.role.toLowerCase()}</span>.
                                            </div>

                                            {inv.invitedAt && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Invited at:{" "}
                                                    <span className="font-semibold text-foreground">{inv.invitedAt}</span>
                                                </div>
                                            )}
                                        </div>

                                        <span
                                            className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ml-2",
                                                inv.status === "PENDING" &&
                                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
                                                inv.status === "ACCEPTED" &&
                                                "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
                                                inv.status === "REJECTED" &&
                                                "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                            )}
                                        >
                                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase()}
                                        </span>
                                    </div>

                                    {inv.status === "PENDING" && hoveredInvitationId === inv.id && (
                                        <div className="flex gap-2 pt-3 border-t border-muted-foreground/10 mt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-3 text-xs"
                                                onClick={async () => {
                                                    const success = await rejectInvitation(inv.id)
                                                    if (success) onReject?.(inv.id)
                                                }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 text-xs"
                                                onClick={async () => {
                                                    const success = await acceptInvitation(inv.id)
                                                    if (success) {
                                                        onAccept?.(inv.id)
                                                        navigate(`/dashboard/project/${inv.projectId}`)
                                                    }
                                                }}
                                            >
                                                Accept
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {hasMore && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-sm mt-2 text-muted-foreground hover:text-foreground"
                                    onClick={handleLoadMore}
                                >
                                    Load more
                                </Button>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </PopoverContent>
        </Popover>
    )
}
