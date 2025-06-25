"use client"

import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res"
import { useGetProjectMembers } from "@/shared/hooks/use-get-project-members"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { EmptyStateIllustration } from "../empty/empty-state"
import { AddMemberModal } from "../modal/add-member-modal"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"

export const DeveloperSection = ({ projectId }: { projectId: string }) => {
    const [members, setMembers] = useState<ProjectUserResponseDTO[]>([])
    const [openDialog, setOpenDialog] = useState(false)
    const { triggerGetProjectMembers } = useGetProjectMembers(projectId)

    useEffect(() => {
        const fetch = async () => {
            const res = await triggerGetProjectMembers("DEVELOPER")
            if (res?.data) setMembers(res.data)
        }
        fetch()
    }, [projectId])

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Developer</h3>
                <Button size="sm" variant="outline" onClick={() => setOpenDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                </Button>
            </div>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ">
                {members.map((member) => (
                    <Card key={member.id} className="rounded-sm px-0 py-0">
                        <CardHeader className="flex flex-row items-center gap-4 px-3 py-3">
                            <Avatar className="cursor-pointer h-8 w-8 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                <AvatarFallback
                                    className={cn("text-sm font-semibold text-white bg-gradient-to-br", getGradientForUser(member.username.charAt(0).toUpperCase()))}
                                >
                                    {getUserInitials(member.username.charAt(0).toUpperCase())}
                                </AvatarFallback>
                            </Avatar>
                            <div className="truncate">
                                <CardTitle className="text-base">{member.username}</CardTitle>
                                <p className="text-xs text-muted-foreground truncate">
                                    {member.email}
                                </p>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
                {members.length === 0 && (
                    <div className="col-span-full">
                        <EmptyStateIllustration type="no-member"></EmptyStateIllustration>
                    </div>
                )}
            </div>


            <AddMemberModal
                projectId={projectId}
                open={openDialog}
                onOpenChange={setOpenDialog}
                defaultRole="DEVELOPER"
            />
        </div>
    )
}
