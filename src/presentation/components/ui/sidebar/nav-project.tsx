"use client"

import {
  IconFile,
  type Icon
} from "@tabler/icons-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/presentation/components/ui/sidebar"
import { Link } from "react-router-dom"

export function NavProject({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild>
            <Link
              to={item.url}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <IconFile className="w-5 h-5 text-blue-600" />
              <span className="text-sm ">{item.name}</span>
            </Link>
          </SidebarMenuButton>

        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
