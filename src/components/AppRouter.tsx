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

const Collaboration = lazy(() => import("@/pages/portal/Collaboration"));
const LearningWorkspace = lazy(() => import("@/pages/portal/LearningWorkspace"));
const Dashboard = lazy(() => import("@/pages/portal/Dashboard"));
const MyResearch = lazy(() => import("@/pages/portal/ResearchWorkspace").then(module => ({ default: module.MyResearch })));
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
const Intake = lazy(() => import("@/pages/portal/Intake"));
const IntakeReview = lazy(() => import("@/pages/portal/IntakeReview"));
const Research = lazy(() => import("@/pages/Research"));
const Programs = lazy(() => import("@/pages/Programs"));
const About = lazy(() => import("@/pages/About"));
const Ecosystem = lazy(() => import("@/pages/Ecosystem"));
const Chapters = lazy(() => import("@/pages/Chapters"));
const Events = lazy(() => import("@/pages/Events"));
const MemberEventDetail = lazy(() => import("@/pages/EventDetail").then(module => ({ default: module.MemberEventDetail })));
const EventDetail = lazy(() => import("@/pages/EventDetail"));
const IYERN = lazy(() => import("@/pages/IYERN"));
const Evidence = lazy(() => import("@/pages/Evidence"));
const Learn = lazy(() => import("@/pages/learn/Learn"));
const FiveFoundations = lazy(() => import("@/pages/learn/FiveFoundations"));
const Debriefs = lazy(() => import("@/pages/learn/Debriefs"));

function PortalFallback() {
  return (
    <main className="min-h-screen bg-background text-foreground" aria-label="Loading page">
      <h1 className="sr-only">Loading page</h1>
      <LoadingState />
    </main>
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
          <Route path="/iyern" element={<IYERN />} />
          <Route path="/iyern/journal" element={<IYERN />} />
          <Route path="/iyern/forum" element={<IYERN />} />
          <Route path="/iyern/fellowship" element={<IYERN />} />
          <Route path="/iyern/challenge" element={<IYERN />} />
          <Route path="/iyern/articles/:slug" element={<IYERN />} />
          <Route path="/research" element={<Research />} />
          <Route path="/research/projects/:slug" element={<Research />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:slug" element={<Programs />} />
          <Route path="/about" element={<About />} />
          <Route path="/ecosystem" element={<Ecosystem />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/debriefed" element={<Debriefs />} />
          <Route path="/debriefed/:slug" element={<Debriefs />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/five-foundations" element={<FiveFoundations />} />
          <Route path="/learn/debriefs" element={<Debriefs />} />
          <Route path="/learn/debriefs/:slug" element={<Debriefs />} />

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
            <Route path="collaboration" element={<Collaboration />} />
            <Route path="learning" element={<LearningWorkspace />} />
            <Route path="my-research" element={<MyResearch />} />
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
            <Route path="programs" element={<Programs embedded />} />
            <Route path="programs/:slug" element={<Programs embedded />} />
            <Route path="pathways" element={<AxiomPathways />} />
            <Route path="pathways/studios" element={<PathwaysStudios />} />
            <Route path="pathways/essays" element={<PathwaysEssays />} />
            <Route path="events" element={<EventsChapters />} />
            <Route path="events/:slug" element={<MemberEventDetail />} />
            <Route path="chapters" element={<Chapters portal />} />
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
            <Route path="apply" element={<Intake />} />
            <Route path="intake-review" element={<RoleGuard allowed={["admin"]}><IntakeReview /></RoleGuard>} />
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
