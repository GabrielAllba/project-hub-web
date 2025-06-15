import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/dashboard-layout";
import { DashboardPage } from "./pages/dashboard-page";
import { LoginPage } from "./pages/login-page";
import { ProjectDetailPage } from "./pages/project-detail-page";
import { ProyekPage } from "./pages/proyek-page";

const NotFoundPage = () => <div>404 Not Found</div>;

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path="project">
          <Route index element={<ProyekPage />} />
          <Route path=":projectId" element={<ProjectDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
