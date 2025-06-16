"use client"

import type { ProjectUserResponseDTO } from "@/domain/dto/res/project-user-res"
import { useGetProjectMembers } from "@/shared/hooks/use-get-project-members"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { AddMemberModal } from "../modal/add-member-modal"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { EmptyState } from "./empty-state"

export const ProductOwnerSection = ({ projectId }: { projectId: string }) => {
    const [members, setMembers] = useState<ProjectUserResponseDTO[]>([])
    const [openDialog, setOpenDialog] = useState(false)
    const { triggerGetProjectMembers } = useGetProjectMembers(projectId)

    useEffect(() => {
        const fetch = async () => {
            const res = await triggerGetProjectMembers("PRODUCT_OWNER")
            if (res?.data) setMembers(res.data)
        }
        fetch()
    }, [projectId])

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Product Owner</h3>
                <Button size="sm" variant="outline" onClick={() => setOpenDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                </Button>
            </div>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                {members.map((member) => (
                    <Card key={member.id} className="rounded-sm">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar>
                                <AvatarFallback>
                                    {member.username
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="truncate">
                                <CardTitle className="text-base">{member.username}</CardTitle>
                                <p className="text-xs text-muted-foreground truncate">
                                    @{member.username} • {member.email}
                                </p>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
                {members.length === 0 && (
                    <EmptyState message="Belum ada anggota product owner yang ditambahkan." />
                )}
            </div>


            <AddMemberModal
                projectId={projectId}
                open={openDialog}
                onOpenChange={setOpenDialog}
                defaultRole="PRODUCT_OWNER"
            />
        </div>
    )
}
