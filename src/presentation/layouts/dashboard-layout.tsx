import { useAuthGuard } from "@/shared/hooks/use-auth-guard";
import { Outlet } from "react-router-dom";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/sidebar/app-sidebar";
import { SiteHeader } from "../components/sidebar/site-header";

export default function DashboardLayout() {
  const { validating } = useAuthGuard();

  if (validating)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
