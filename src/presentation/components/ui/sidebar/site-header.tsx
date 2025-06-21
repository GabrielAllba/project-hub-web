"use client"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { InvitationResponseDTO } from "@/domain/dto/res/invitation-res"
import { Separator } from "@/presentation/components/ui/separator"
import { SidebarTrigger } from "@/presentation/components/ui/sidebar"
import { useUser } from "@/shared/contexts/user-context"
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

  const [enrichedInvitations, setEnrichedInvitations] = useState<InvitationResponseDTO[]>([])


  useEffect(() => {
    if (user?.id) {
      triggerGetProjectInvitations(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
    }
  }, [user?.id])

  useEffect(() => {
    const invitations = triggerGetProjectInvitationsResponse?.data?.content || []
    setEnrichedInvitations(invitations)

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
      <div className="flex w-full items-center py-2 gap-1 px-4 lg:gap-2 lg:px-6">
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
