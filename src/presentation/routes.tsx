import { IconError404 } from "@tabler/icons-react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/dashboard-layout";
import { DashboardPage } from "./pages/dashboard-page";
import { EmailVerificationPage } from "./pages/email-verification-page";
import { FirstTimeUserPage } from "./pages/first-time-user-page";
import { LoginPage } from "./pages/login-page";
import { ProjectDetailPage } from "./pages/project-detail-page";
import { RegisterPage } from "./pages/register-page";
import { VerifyEmailProcessPage } from "./pages/verify-email-process-page";

export const NotFoundPage = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600/10 text-blue-600 p-4 rounded-full">
            <IconError404 className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-blue-800 mb-2">404 - Page Not Found</h1>
        <p className="text-sm text-blue-600 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          Back to Project Dashboard
        </Link>
      </div>
    </div>
  )
}

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="project/:projectId" element={<ProjectDetailPage />} />
        <Route path="first-time-user" element={<FirstTimeUserPage />} />
      </Route>

      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/verify-email-process" element={<VerifyEmailProcessPage />} />


      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);