"use client"

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
import { NavUser } from "@/presentation/components/ui/sidebar/nav-user"
import { useProjects } from "@/shared/contexts/project-context"
import { useUser } from "@/shared/contexts/user-context"
import {
  IconFileWord,
  IconFolder,
  IconInnerShadowTop,
} from "@tabler/icons-react"
import * as React from "react"
import { Link } from "react-router-dom"
import { Skeleton } from "../skeleton"
import { NavProject } from "./nav-project"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconFolder,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading: userLoading } = useUser()
  const { projects, isInitialLoading } = useProjects()

  const proyekNavItems = projects
    .slice(0, 5)
    .map((project) => ({
      name: project.name,
      url: `/dashboard/project/${project.projectId}`,
      icon: IconFileWord,
    }))

  if (!userLoading && !user?.isUserFirstTime) {
    return (
      <Sidebar
        collapsible="offcanvas"
        className="bg-transparent text-card-foreground p-2"
        {...props}
      >
        {/* Header */}
        <SidebarHeader className="bg-white px-4 py-3 rounded-t-md shadow-2xl border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="w-full flex items-center justify-start gap-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                <Link to="/dashboard/project" className="flex items-center gap-2">
                  <IconInnerShadowTop className="size-5 text-blue-600" />
                  <span className="text-lg font-bold text-blue-900 ">Project Hub</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Main Content */}
        <SidebarContent className="bg-white flex-1 overflow-y-auto pt-4 pb-2 ">
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold uppercase text-zinc-500 mb-3 tracking-wide">
              Main Menu
            </h3>
            <NavMain items={navMain} />
          </div>

          <div className="px-4 mt-6">
            <h3 className="text-xs font-semibold uppercase text-zinc-500 mb-3 tracking-wide">
              Recent Projects
            </h3>
            {isInitialLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-md bg-zinc-100" />
                ))}
              </div>
            ) : (
              <NavProject items={proyekNavItems} />
            )}
          </div>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="bg-white px-4 py-3">
          {userLoading ? (
            <div className="w-full flex items-center gap-3 py-2">
              <Skeleton className="h-10 w-10 rounded-full bg-zinc-200" />
              <div className="flex flex-col flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded bg-zinc-200" />
                <Skeleton className="h-3 w-1/2 rounded bg-zinc-200" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center justify-between gap-2">
              <NavUser
                user={{
                  username: user.username,
                  email: user.email,
                  avatar: "/avatars/default.jpg",
                }}
              />
            </div>
          ) : null}
        </SidebarFooter>
      </Sidebar>
    )
  }

  return null
}
