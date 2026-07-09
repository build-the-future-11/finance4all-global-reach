import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FluidCursor from "@/components/FluidCursor";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/portal/ProtectedRoute";
import RoleGuard from "@/components/portal/RoleGuard";
import PortalLayout from "@/layouts/PortalLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Onboarding from "./pages/auth/Onboarding";
import AuthCallback from "./pages/auth/AuthCallback";
import Dashboard from "./pages/portal/Dashboard";
import DebriefedHub from "./pages/portal/debriefed/DebriefedHub";
import DebriefedExplainers from "./pages/portal/debriefed/DebriefedExplainers";
import MetaLabs from "./pages/portal/labs/MetaLabs";
import LabReview from "./pages/portal/labs/LabReview";
import AxiomPathways from "./pages/portal/pathways/AxiomPathways";
import PathwaysStudios from "./pages/portal/pathways/PathwaysStudios";
import PathwaysEssays from "./pages/portal/pathways/PathwaysEssays";
import EventsChapters from "./pages/portal/events/EventsChapters";
import Networking from "./pages/portal/network/Networking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <FluidCursor />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

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
              <Route path="network/profile/:id" element={<Networking />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
