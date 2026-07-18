import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapLabApplication, mapMemberDirectoryProfile, mapResearchProject } from "@/lib/mappers";
import type { LabApplicationStatus, ResearchProjectStatus } from "@/types/domain";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";

export function useResearchProjects(status?: ResearchProjectStatus | "all") {
  return useQuery({
    queryKey: ["research-projects", status],
    queryFn: async () => {
      let q = supabase.from("research_projects").select("*").order("created_at", { ascending: false });
      if (status && status !== "all") q = q.eq("status", status);
      else q = q.neq("status", "draft");
      const { data, error } = await q;
      if (error) throw error;
      return data.map(mapResearchProject);
    },
  });
}

export function useResearchProject(id: string | undefined) {
  return useQuery({
    queryKey: ["research-project", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_projects")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return mapResearchProject(data);
    },
  });
}

export function useMyLabApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-lab-applications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_applications")
        .select("*")
        .eq("applicant_id", user!.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data.map(mapLabApplication);
    },
  });
}

export function useProjectApplications(projectId?: string) {
  return useQuery({
    queryKey: ["project-applications", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_applications")
        .select("*")
        .eq("project_id", projectId!)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data.map(mapLabApplication);
    },
  });
}

export function useReviewQueue() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["review-queue", profile?.id],
    enabled: Boolean(profile) && (profile?.role === "lead_researcher" || profile?.role === "admin"),
    queryFn: async () => {
      let projectIds: string[] | null = null;
      if (profile?.role === "lead_researcher") {
        const { data: projects, error: projErr } = await supabase
          .from("research_projects")
          .select("id")
          .eq("lead_researcher_id", profile.id);
        if (projErr) throw projErr;
        projectIds = projects?.map((p) => p.id) ?? [];
        if (projectIds.length === 0) return [];
      }

      let q = supabase
        .from("lab_applications")
        .select("*")
        .in("status", ["pending", "under_review"])
        .order("submitted_at", { ascending: true });

      if (projectIds) q = q.in("project_id", projectIds);

      const { data: apps, error } = await q;
      if (error) throw error;

      const ids = [...new Set(apps.map((a) => a.project_id))];
      const { data: projects } = await supabase
        .from("research_projects")
        .select("id, title")
        .in("id", ids);
      const titleMap = Object.fromEntries(projects?.map((p) => [p.id, p.title]) ?? []);

      return apps.map((row) => ({
        ...mapLabApplication(row),
        projectTitle: titleMap[row.project_id] ?? "Unknown project",
      }));
    },
  });
}

export function useSubmitLabApplication() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, motivation }: { projectId: string; motivation: string }) => {
      const trimmedMotivation = motivation.trim();
      if (trimmedMotivation.length < 30) {
        throw new Error("Please share a short motivation statement with at least 30 characters.");
      }

      const { error } = await supabase.from("lab_applications").insert({
        project_id: projectId,
        applicant_id: user!.id,
        motivation: trimmedMotivation,
      });
      if (error) {
        if (error.code === "23505") {
          throw new Error("You already applied to this project. Check status on your dashboard.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      trackEvent("research.application_submitted");
      qc.invalidateQueries({ queryKey: ["my-lab-applications"] });
      qc.invalidateQueries({ queryKey: ["project-applications"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: LabApplicationStatus;
    }) => {
      const { error } = await supabase
        .from("lab_applications")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewer_id: user!.id,
        })
        .eq("id", applicationId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      trackEvent("research.application_decided", { decision: variables.status });
      qc.invalidateQueries({ queryKey: ["review-queue"] });
      qc.invalidateQueries({ queryKey: ["project-applications"] });
    },
  });
}

export function useCreateResearchProject() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      tags: string[];
      status: ResearchProjectStatus;
      applicationDeadline?: string;
    }) => {
      const { error } = await supabase.from("research_projects").insert({
        title: input.title,
        description: input.description,
        tags: input.tags,
        status: input.status,
        lead_researcher_id: user!.id,
        application_deadline: input.applicationDeadline ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["research-projects"] }),
  });
}

export function useProfilesByIds(ids: string[]) {
  return useQuery({
    queryKey: ["profiles", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("member_directory").select("*").in("id", ids);
      if (error) throw error;
      return Object.fromEntries(data.map((p) => [p.id, mapMemberDirectoryProfile(p)]));
    },
  });
}
