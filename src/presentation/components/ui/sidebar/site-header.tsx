"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { ProjectInvitation } from "@/domain/entities/invitation"
import { Separator } from "@/presentation/components/ui/separator"
import { SidebarTrigger } from "@/presentation/components/ui/sidebar"
import { useUser } from "@/shared/contexts/user-context"
import { useFindUser } from "@/shared/hooks/use-find-user"
import { useGetProjectById } from "@/shared/hooks/use-get-project-by-id"
import { useGetProjectInvitations } from "@/shared/hooks/use-get-project-invitations"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { InvitationDialog } from "../../dialog/invitation-dialog"

export function SiteHeader() {
  const { user } = useUser()

  const {
    triggerGetProjectInvitations,
    triggerGetProjectInvitationsLoading,
    triggerGetProjectInvitationsResponse,
  } = useGetProjectInvitations(user?.id || "")

  const [usernamesById, setUsernamesById] = useState<Record<string, string>>({})
  const [projectNamesById, setProjectNamesById] = useState<Record<string, string>>({})
  const [enrichedInvitations, setEnrichedInvitations] = useState<ProjectInvitation[]>([])

  const { triggerFindUser } = useFindUser()
  const { triggerGetProjectById } = useGetProjectById("") // dummy init

  useEffect(() => {
    if (user?.id) {
      triggerGetProjectInvitations(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
    }
  }, [user?.id])

  useEffect(() => {
    const invitations: ProjectInvitation[] = triggerGetProjectInvitationsResponse?.data?.content || []

    const enrichData = async () => {
      const uniqueUserIds = [...new Set(invitations.map((inv) => inv.inviterId))]
      const uniqueProjectIds = [...new Set(invitations.map((inv) => inv.projectId))]

      const updatedUsernames: Record<string, string> = { ...usernamesById }
      const updatedProjectNames: Record<string, string> = { ...projectNamesById }

      for (const userId of uniqueUserIds) {
        if (!updatedUsernames[userId]) {
          const res = await triggerFindUser(userId)
          if (res?.status === "success" && res.data?.username) {
            updatedUsernames[userId] = res.data.username
          }
        }
      }

      for (const projectId of uniqueProjectIds) {
        if (!updatedProjectNames[projectId]) {
          const res = await triggerGetProjectById(projectId)
          if (res?.status === "success" && res.data?.name) {
            updatedProjectNames[projectId] = res.data.name
          }
        }
      }

      setUsernamesById(updatedUsernames)
      setProjectNamesById(updatedProjectNames)

      const enriched = invitations.map((inv) => ({
        ...inv,
        inviterUsername: updatedUsernames[inv.inviterId] || inv.inviterId,
        projectName: updatedProjectNames[inv.projectId] || inv.projectId,
      }))

      setEnrichedInvitations(enriched)
    }

    if (invitations.length > 0) {
      enrichData()
    }
  }, [triggerGetProjectInvitationsResponse])

  const handleAccept = async () => {
    // Refetch invitations
    await triggerGetProjectInvitations(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)

    toast.success("Invitation accepted: You have successfully joined the project.")
  }

  const handleReject = async () => {
    // Refetch invitations
    await triggerGetProjectInvitations(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)

    toast.success("Invitation rejected: You have declined the invitation.")
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <div className="ml-auto flex items-center gap-2">
          <InvitationDialog
            invitations={enrichedInvitations}
            loading={triggerGetProjectInvitationsLoading}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
      </div>
    </header>
  )
}
