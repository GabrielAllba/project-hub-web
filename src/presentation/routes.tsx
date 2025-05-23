import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/dashboard-layout";
import { DashboardPage } from "./pages/dashboard-page";
import { LoginPage } from "./pages/login-page";
import { ProyekPage } from "./pages/proyek-page";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="proyek" element={<ProyekPage />} />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  </BrowserRouter>
);
