import { useAuthGuard } from "@/shared/hooks/use-auth-guard"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "../components/sidebar/app-sidebar"
import { SiteHeader } from "../components/sidebar/site-header"
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar"

export default function DashboardLayout() {
  useAuthGuard()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <>
          <SiteHeader />
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4">
              <Outlet />
            </main>
          </div>
        </>
      </SidebarInset>
    </SidebarProvider>
  )
}
