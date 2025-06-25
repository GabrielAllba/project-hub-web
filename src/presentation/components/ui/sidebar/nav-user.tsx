"use client"

import {
  IconDotsVertical,
  IconLogout
} from "@tabler/icons-react";

import {
  Avatar,
  AvatarFallback
} from "@/presentation/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/presentation/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/presentation/components/ui/sidebar";

import { useLogout } from "@/shared/hooks/use-logout";
import { cn } from "@/shared/utils/merge-class";
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function NavUser({
  user,
}: {
  user: {
    username: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();


  const { triggerLogout, triggerLogoutloading } = useLogout();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await triggerLogout();
      localStorage.removeItem("accessToken");
      navigate("/");
      toast.info("Successfully logged out!")
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 border-2 border-white shadow-sm ring-1 ring-slate-100">
                <AvatarFallback
                  className={cn("text-sm font-semibold text-white bg-gradient-to-br", getGradientForUser(user.username.charAt(0).toUpperCase()))}
                >
                  {getUserInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.username}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm ring-1 ring-slate-100">
                  <AvatarFallback
                    className={cn("text-sm font-semibold text-white bg-gradient-to-br", getGradientForUser(user.username.charAt(0).toUpperCase()))}
                  >
                    {getUserInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.username}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={triggerLogoutloading}
              onClick={handleLogout}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
