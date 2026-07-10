import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateResearchProject,
  useMyLabApplications,
  useProfilesByIds,
  useResearchProject,
  useResearchProjects,
  useSubmitLabApplication,
} from "@/hooks/portal/useLabs";
import { useProjectBookmarks, useToggleProjectBookmark } from "@/hooks/portal/useBookmarks";
import { portalRoutes } from "@/routes/portal";
import type { ResearchProjectStatus } from "@/types/domain";
import BookmarkButton from "@/components/portal/BookmarkButton";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  QueryStatus,
  portalInputClass,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const STATUSES: { value: ResearchProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "closed", label: "Closed" },
];

function ProjectDetail({ id }: { id: string }) {
  useDocumentTitle("Lab project");
  const { profile } = useAuth();
  const { data: project, isLoading, error } = useResearchProject(id);
  const { data: myApps } = useMyLabApplications();
  const { data: leads } = useProfilesByIds(project ? [project.leadResearcherId] : []);
  const { data: bookmarks } = useProjectBookmarks();
  const toggleBookmark = useToggleProjectBookmark();
  const submitApp = useSubmitLabApplication();
  const [motivation, setMotivation] = useState("");
  const [open, setOpen] = useState(false);

  const alreadyApplied = myApps?.some((a) => a.projectId === id);
  const lead = project ? leads?.[project.leadResearcherId] : undefined;
  const saved = bookmarks?.has(id) ?? false;

  const handleApply = async () => {
    if (!motivation.trim()) return;
    try {
      await submitApp.mutateAsync({ projectId: id, motivation });
      toast.success("Application submitted");
      setOpen(false);
      setMotivation("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to apply");
    }
  };

  if (isLoading) {
    return (
      <QueryStatus isLoading error={null}>
        <div />
      </QueryStatus>
    );
  }
  if (error || !project) return <EmptyState message="Project not found." />;

  return (
    <div>
      <Link
        to={portalRoutes.labs}
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="capitalize">{project.status.replace("_", " ")}</Badge>
          {project.tags.map((t) => (
            <span key={t} className="text-xs text-white/40">
              #{t}
            </span>
          ))}
        </div>
        <BookmarkButton
          saved={saved}
          loading={toggleBookmark.isPending}
          label="Save"
          onToggle={() => toggleBookmark.mutateAsync({ projectId: id, saved })}
        />
      </div>
      <h1 className="mt-3 text-3xl font-bold text-white">{project.title}</h1>
      {lead && (
        <p className="mt-2 text-sm text-white/50">
          Lead: <span className="text-white/80">{lead.displayName}</span>
        </p>
      )}
      <PortalCard className="mt-6 p-6">
        <p className="whitespace-pre-wrap text-white/80">{project.description}</p>
        {project.applicationDeadline && (
          <p className="mt-4 text-sm text-white/50">
            Deadline: {new Date(project.applicationDeadline).toLocaleDateString()}
          </p>
        )}
      </PortalCard>

      {project.status === "open" && profile && project.leadResearcherId !== profile.id && (
        <div className="mt-6">
          {alreadyApplied ? (
            <Badge className="bg-emerald-400/15 text-emerald-300">Application submitted</Badge>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-400">Apply to this project</Button>
              </DialogTrigger>
              <DialogContent className="border-white/15 bg-[#0c1220] text-white">
                <DialogHeader>
                  <DialogTitle>Apply to {project.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/70">Why are you interested?</Label>
                    <Textarea
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      rows={4}
                      className={portalInputClass}
                    />
                  </div>
                  <Button
                    onClick={handleApply}
                    disabled={submitApp.isPending}
                    className="bg-emerald-500 hover:bg-emerald-400"
                  >
                    Submit application
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}

export default function MetaLabs() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tagFromUrl = searchParams.get("tag") ?? "";
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ResearchProjectStatus | "all">("all");
  const [search, setSearch] = useState(tagFromUrl);
  const { data: projects, isLoading, error, refetch } = useResearchProjects();
  const { data: bookmarks } = useProjectBookmarks();
  const toggleBookmark = useToggleProjectBookmark();
  const createProject = useCreateResearchProject();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  useDocumentTitle(id ? "Lab project" : "Meta Labs");

  const canCreate = profile?.role === "lead_researcher" || profile?.role === "admin";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects?.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, statusFilter, search]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    try {
      await createProject.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: "open",
      });
      toast.success("Project published");
      setOpen(false);
      setTitle("");
      setDescription("");
      setTags("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    }
  };

  if (id) return <ProjectDetail id={id} />;

  return (
    <div>
      <PortalPageHeader
        eyebrow="Research"
        title="Finance Meta Labs"
        description="Research projects with verified lead researchers and open applications."
        action={
          canCreate ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-400">
                  <Plus className="h-4 w-4" /> New project
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/15 bg-[#0c1220] text-white">
                <DialogHeader>
                  <DialogTitle>Publish research project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/70">Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className={portalInputClass} />
                  </div>
                  <div>
                    <Label className="text-white/70">Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className={portalInputClass}
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">Tags (comma-separated)</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="macro, fintech"
                      className={portalInputClass}
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={createProject.isPending}
                    className="bg-emerald-500 hover:bg-emerald-400"
                  >
                    Publish
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ResearchProjectStatus | "all")}
        >
          <TabsList className="h-auto flex-wrap gap-1 bg-white/[0.04] p-1">
            {STATUSES.map((s) => (
              <TabsTrigger
                key={s.value}
                value={s.value}
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300"
              >
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className={`max-w-xs ${portalInputClass}`}
        />
      </div>

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={!filtered?.length}
        emptyMessage="No projects match your filters."
        onRetry={() => refetch()}
      >
        <div className="space-y-4">
          {filtered?.map((project) => {
            const saved = bookmarks?.has(project.id) ?? false;
            return (
              <PortalCard key={project.id} hover className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link to={`${portalRoutes.labs}/${project.id}`} className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                        {project.status.replace("_", " ")}
                      </Badge>
                      {project.tags.map((t) => (
                        <span key={t} className="text-xs text-white/40">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white transition hover:text-emerald-300">
                      {project.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-white/55">{project.description}</p>
                  </Link>
                  <BookmarkButton
                    saved={saved}
                    loading={toggleBookmark.isPending}
                    label="Save"
                    onToggle={() =>
                      toggleBookmark.mutateAsync({ projectId: project.id, saved })
                    }
                  />
                </div>
              </PortalCard>
            );
          })}
        </div>
      </QueryStatus>
    </div>
  );
}
