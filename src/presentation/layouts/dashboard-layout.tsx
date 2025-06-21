import { UserProvider } from "@/shared/contexts/user-context"
import { useAuthGuard } from "@/shared/hooks/use-auth-guard"
import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar"
import { AppSidebar } from "../components/ui/sidebar/app-sidebar"
import { SiteHeader } from "../components/ui/sidebar/site-header"
import { ProjectProvider } from "@/shared/contexts/project-context"

export default function DashboardLayout() {

  useAuthGuard()

  return (
    <UserProvider>
      <SidebarProvider>
        <ProjectProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <>
              <SiteHeader />
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-1 flex-col gap-2 p-6 pt-2">
                  <Outlet />
                </div>
              </div>
            </>
          </SidebarInset>
        </ProjectProvider>
      </SidebarProvider>
    </UserProvider>
  )
}
