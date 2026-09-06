import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/portal/ProtectedRoute";
import RoleGuard from "@/components/portal/RoleGuard";
import { LoadingState } from "@/components/portal/PortalUI";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Onboarding from "@/pages/auth/Onboarding";
import AuthCallback from "@/pages/auth/AuthCallback";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import PortalLayout from "@/layouts/PortalLayout";

const Dashboard = lazy(() => import("@/pages/portal/Dashboard"));
const DebriefedHub = lazy(() => import("@/pages/portal/debriefed/DebriefedHub"));
const DebriefedExplainers = lazy(() => import("@/pages/portal/debriefed/DebriefedExplainers"));
const MetaLabs = lazy(() => import("@/pages/portal/labs/MetaLabs"));
const LabReview = lazy(() => import("@/pages/portal/labs/LabReview"));
const AxiomPathways = lazy(() => import("@/pages/portal/pathways/AxiomPathways"));
const PathwaysStudios = lazy(() => import("@/pages/portal/pathways/PathwaysStudios"));
const PathwaysEssays = lazy(() => import("@/pages/portal/pathways/PathwaysEssays"));
const EventsChapters = lazy(() => import("@/pages/portal/events/EventsChapters"));
const Networking = lazy(() => import("@/pages/portal/network/Networking"));
const MemberProfile = lazy(() => import("@/pages/portal/network/MemberProfile"));
const Admin = lazy(() => import("@/pages/portal/Admin"));
const Saved = lazy(() => import("@/pages/portal/Saved"));
const Settings = lazy(() => import("@/pages/portal/Settings"));

function PortalFallback() {
  return (
    <div className="min-h-[50vh]">
      <LoadingState />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PortalFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="debriefed" element={<DebriefedHub />} />
            <Route path="debriefed/explainers" element={<DebriefedExplainers />} />
            <Route path="debriefed/explainers/:slug" element={<DebriefedExplainers />} />
            <Route path="labs" element={<MetaLabs />} />
            <Route
              path="labs/review"
              element={
                <RoleGuard allowed={["lead_researcher", "admin"]}>
                  <LabReview />
                </RoleGuard>
              }
            />
            <Route path="labs/:id" element={<MetaLabs />} />
            <Route path="pathways" element={<AxiomPathways />} />
            <Route path="pathways/studios" element={<PathwaysStudios />} />
            <Route path="pathways/essays" element={<PathwaysEssays />} />
            <Route path="events" element={<EventsChapters />} />
            <Route path="network" element={<Networking />} />
            <Route path="network/profile/:id" element={<MemberProfile />} />
            <Route
              path="admin"
              element={
                <RoleGuard allowed={["admin"]}>
                  <Admin />
                </RoleGuard>
              }
            />
            <Route path="settings" element={<Settings />} />
            <Route path="saved" element={<Saved />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
    </Suspense>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
