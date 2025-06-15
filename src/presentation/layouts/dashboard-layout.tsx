import { useAuthGuard } from "@/shared/hooks/use-auth-guard"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "../components/ui/sidebar/app-sidebar"
import { SiteHeader } from "../components/ui/sidebar/site-header"
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar"
import { UserProvider } from "@/shared/contexts/user-context"

export default function DashboardLayout() {
  useAuthGuard()

  return (
    <UserProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <>
            <SiteHeader />
            <main className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-1 flex-col gap-2">
                <Outlet />
              </div>
            </main>
          </>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
