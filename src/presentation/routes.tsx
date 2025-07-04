import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "./components/not-found/not-found";
import DashboardLayout from "./layouts/dashboard-layout";
import { ArchivedProjects } from "./pages/archived-projects";
import { DashboardPage } from "./pages/dashboard-page";
import { EmailVerificationPage } from "./pages/email-verification-page";
import { FirstTimeUserPage } from "./pages/first-time-user-page";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { ProjectDetailPage } from "./pages/project-detail-page";
import { RegisterPage } from "./pages/register-page";
import { VerifyEmailProcessPage } from "./pages/verify-email-process-page";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects/archived" element={<ArchivedProjects />} />
        <Route path="project/:projectId" element={<ProjectDetailPage />} />
        <Route path="first-time-user" element={<FirstTimeUserPage />} />
      </Route>

      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/verify-email-process" element={<VerifyEmailProcessPage />} />


      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);