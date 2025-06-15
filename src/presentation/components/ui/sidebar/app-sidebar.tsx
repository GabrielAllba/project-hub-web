import {
  IconDashboard,
  IconFileWord,
  IconFolder,
  IconInnerShadowTop
} from "@tabler/icons-react"
import * as React from "react"

import type { ProjectSummary } from "@/domain/entities/project-summary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/presentation/components/ui/sidebar"
import { NavMain } from "@/presentation/components/ui/sidebar/nav-main"
import { NavProyek } from "@/presentation/components/ui/sidebar/nav-proyek"
import { NavUser } from "@/presentation/components/ui/sidebar/nav-user"
import { useGetMyProjectSidebar } from "@/shared/hooks/use-get-my-project-sidebar"
import { useEffect, useState } from 'react'
import { Skeleton } from "../skeleton"
import { useUser } from "@/shared/contexts/user-context"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Proyek",
    url: "/dashboard/project",
    icon: IconFolder,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading: triggerGetMeloading } = useUser()
  const [projects, setProjects] = useState<ProjectSummary[]>([])

  const {
    triggerSidebarProjects,
    sidebarProjectsResponse,
    sidebarProjectsLoading,
  } = useGetMyProjectSidebar()

  useEffect(() => {
    triggerSidebarProjects()
  }, [])

  useEffect(() => {
    if (sidebarProjectsResponse?.data.content) {
      setProjects(sidebarProjectsResponse.data.content)
    }
  }, [sidebarProjectsResponse])

  const proyekNavItems = projects.map((project) => ({
    name: project.name,
    url: `/projects/${project.projectId}`,
    icon: IconFileWord,
  }))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Project Hub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        {sidebarProjectsLoading ? (
          <div className="w-full space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-md bg-gray-200" />
            ))}
          </div>
        ) : (
          <NavProyek items={proyekNavItems} />
        )}
      </SidebarContent>

      <SidebarFooter>
        {triggerGetMeloading ? (
          <div className="w-full flex items-center gap-3 py-4 px-4">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex flex-col flex-1 space-y-2">
              <Skeleton className="h-4 w-full rounded bg-gray-200" />
              <Skeleton className="h-3 w-full rounded bg-gray-200" />
            </div>
          </div>
        ) : user ? (
          <NavUser
            user={{
              username: user.username,
              email: user.email,
              avatar: "/avatars/default.jpg",
            }}
          />
        ) : null}
      </SidebarFooter>
    </Sidebar>
  )
}
