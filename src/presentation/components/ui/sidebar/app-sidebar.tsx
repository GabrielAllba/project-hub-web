import {
  IconArchive,
  IconChartBar,
  IconDashboard,
  IconFileWord,
  IconFolder,
  IconInnerShadowTop,
  IconUsers,
} from "@tabler/icons-react"
import * as React from "react"

import type { ProjectSummary } from "@/domain/entities/project-summary"
import type { User } from "@/domain/entities/user"
import { NavMain } from "@/presentation/components/ui/sidebar/nav-main"
import { NavProyek } from "@/presentation/components/ui/sidebar/nav-proyek"
import { NavUser } from "@/presentation/components/ui/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/presentation/components/ui/sidebar"
import { useGetMe } from "@/shared/hooks/use-get-me"
import { useGetMyProjectSidebar } from "@/shared/hooks/use-get-my-project-sidebar"
import { useEffect, useState } from 'react'
import { Skeleton } from "../skeleton"

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
  {
    title: "Tugas Saya",
    url: "/my-tasks",
    icon: IconChartBar,
  },
  {
    title: "Tim",
    url: "/dashboard/teams",
    icon: IconUsers,
  },
  {
    title: "Arsip",
    url: "/archive",
    icon: IconArchive,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<User>()
  const [projects, setProjects] = useState<ProjectSummary[]>([])

  const { triggerGetMe, triggerGetMeResponse, triggerGetMeloading } = useGetMe()
  const {
    triggerSidebarProjects,
    sidebarProjectsResponse,
    sidebarProjectsLoading,
  } = useGetMyProjectSidebar()

  useEffect(() => {
    const fetchInitialData = async () => {
      await triggerGetMe()
      await triggerSidebarProjects()
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    if (triggerGetMeResponse) {
      setUser({
        username: triggerGetMeResponse.data.username,
        email: triggerGetMeResponse.data.email,
      })
    }
  }, [triggerGetMeResponse])

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