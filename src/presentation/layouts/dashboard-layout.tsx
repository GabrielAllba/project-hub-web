
import { useAuthGuard } from "@/shared/hooks/use-auth-guard";
import { Outlet } from "react-router-dom";
import { LoadingSpinner } from "../components/ui/loading-spinner";

export default function DashboardLayout() {
  const { validating } = useAuthGuard();

  if (validating) return <div className="w-full h-screen justify-center items-center flex">
    <LoadingSpinner></LoadingSpinner>
  </div>

  return (
    <div className="flex h-screen">

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
