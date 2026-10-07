import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";
import type { Database, Tables } from "@/types/database";

type StoredTaskInput = Database["public"]["Tables"]["project_tasks"]["Insert"];
type NewTaskInput = Omit<StoredTaskInput, "project_id"> & { project_id?: string };
type MembershipStatus = Tables<"project_memberships">["status"];
type TaskStatus = Tables<"project_tasks">["status"];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireUuid(value: string, label: string) {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new Error(`Choose a valid ${label}.`);
  return normalized;
}

function validIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function normalizeEvidence(status: TaskStatus, value: string) {
  const evidence = value.trim();
  if ((status === "submitted" || status === "done") && !evidence) {
    throw new Error("An HTTPS evidence link is required for submitted or completed work.");
  }
  if (!evidence) return "";
  if (evidence.length > 1000) throw new Error("Evidence links must be at most 1,000 characters.");
  let url: URL;
  try {
    url = new URL(evidence);
  } catch {
    throw new Error("Use a valid HTTPS evidence link without credentials.");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Use a valid HTTPS evidence link without credentials.");
  }
  return evidence;
}

function normalizeTaskInput(projectId: string, input: NewTaskInput): StoredTaskInput {
  const title = input.title.trim();
  if (title.length < 3 || title.length > 200) throw new Error("Task titles must be between 3 and 200 characters.");
  const description = input.description ?? "";
  if (description.length > 4000) throw new Error("Task descriptions must be at most 4,000 characters.");
  const assignee = input.assignee_id ? requireUuid(input.assignee_id, "assignee account ID") : null;
  const dueDate = input.due_date ?? null;
  if (dueDate && !validIsoDate(dueDate)) throw new Error("Choose a valid due date.");
  if (input.kind && input.kind !== "task" && input.kind !== "milestone") throw new Error("Choose a valid work item kind.");
  return {
    project_id: requireUuid(projectId, "project"),
    title,
    description,
    assignee_id: assignee,
    due_date: dueDate,
    kind: input.kind ?? "task",
  };
}

export function useCollaboration(projectId: string) {
  const { user } = useAuth();
  const client = useQueryClient();
  const memberships = useQuery({
    queryKey: ["project-memberships", user?.id, projectId],
    enabled: Boolean(user),
    queryFn: async () => {
      let query = supabase.from("project_memberships").select("*");
      query = projectId ? query.eq("project_id", projectId) : query.eq("user_id", user!.id);
      const { data, error } = await query.order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const tasks = useQuery({
    queryKey: ["project-tasks", user?.id, projectId],
    enabled: Boolean(user && projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("due_date", { nullsFirst: false })
        .order("id");
      if (error) throw error;
      return data;
    },
  });
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["project-memberships"] }),
      client.invalidateQueries({ queryKey: ["project-tasks"] }),
      client.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  };
  const invite = useMutation({
    mutationFn: async (memberId: string) => {
      const result = await supabase
        .from("project_memberships")
        .insert({ project_id: requireUuid(projectId, "project"), user_id: requireUuid(memberId, "member account ID") })
        .select("*")
        .single();
      return requireConfirmedRow(result, "Sending invitation");
    },
    onSuccess: refresh,
  });
  const respond = useMutation({
    mutationFn: async ({ project_id, user_id, status, previous }: { project_id: string; user_id: string; status: MembershipStatus; previous: MembershipStatus }) => {
      const result = await supabase
        .from("project_memberships")
        .update({ status })
        .eq("project_id", requireUuid(project_id, "project"))
        .eq("user_id", requireUuid(user_id, "member account ID"))
        .eq("status", previous)
        .select("*")
        .maybeSingle();
      return requireConfirmedRow(result, "Updating membership");
    },
    onSuccess: refresh,
  });
  const createTask = useMutation({
    mutationFn: async (input: NewTaskInput) => {
      const result = await supabase.from("project_tasks").insert(normalizeTaskInput(projectId, input)).select("*").single();
      return requireConfirmedRow(result, "Creating task");
    },
    onSuccess: refresh,
  });
  const updateTask = useMutation({
    mutationFn: async ({ id, revision, status, evidence_url }: { id: string; revision: number; status: TaskStatus; evidence_url: string }) => {
      const selectedProject = requireUuid(projectId, "project");
      const evidence = normalizeEvidence(status, evidence_url);
      const result = await supabase
        .from("project_tasks")
        .update({ status, evidence_url: evidence })
        .eq("project_id", selectedProject)
        .eq("id", id)
        .eq("revision", revision)
        .select("*")
        .maybeSingle();
      if (!result.error && !result.data) throw new Error("This task changed or access was removed. Reload before retrying.");
      return requireConfirmedRow(result, "Updating task");
    },
    onSuccess: refresh,
  });
  return { memberships, tasks, invite, respond, createTask, updateTask };
}
