import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { portalRoutes } from "@/routes/portal";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
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
import { toast } from "sonner";

function ProjectDetail({ id }: { id: string }) {
  const { profile } = useAuth();
  const { data: project, isLoading } = useResearchProject(id);
  const { data: myApps } = useMyLabApplications();
  const { data: leads } = useProfilesByIds(project ? [project.leadResearcherId] : []);
  const submitApp = useSubmitLabApplication();
  const [motivation, setMotivation] = useState("");
  const [open, setOpen] = useState(false);

  const alreadyApplied = myApps?.some((a) => a.projectId === id);
  const lead = project ? leads?.[project.leadResearcherId] : undefined;

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

  if (isLoading) return <LoadingState />;
  if (!project) return <EmptyState message="Project not found." />;

  return (
    <div>
      <Link to={portalRoutes.labs} className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="capitalize">{project.status}</Badge>
        {project.tags.map((t) => (
          <span key={t} className="text-xs text-white/40">#{t}</span>
        ))}
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

      {project.status === "open" && profile?.role === "member" && (
        <div className="mt-6">
          {alreadyApplied ? (
            <Badge className="bg-emerald-400/15 text-emerald-300">Application submitted</Badge>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Apply to this project</Button>
              </DialogTrigger>
              <DialogContent className="border-white/15 bg-[#0c1220] text-white">
                <DialogHeader>
                  <DialogTitle>Apply to {project.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Why are you interested?</Label>
                    <Textarea
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      rows={4}
                      className="mt-1 border-white/20 bg-white/5"
                    />
                  </div>
                  <Button onClick={handleApply} disabled={submitApp.isPending}>
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
  const { profile } = useAuth();
  const { data: projects, isLoading, error } = useResearchProjects();
  const createProject = useCreateResearchProject();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const canCreate = profile?.role === "lead_researcher" || profile?.role === "admin";

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    try {
      await createProject.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
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
        title="Finance Meta Labs"
        description="Research projects with verified lead researchers and open applications."
        action={
          canCreate ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4" /> New project</Button>
              </DialogTrigger>
              <DialogContent className="border-white/15 bg-[#0c1220] text-white">
                <DialogHeader><DialogTitle>Publish research project</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 border-white/20 bg-white/5" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 border-white/20 bg-white/5" />
                  </div>
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="macro, fintech" className="mt-1 border-white/20 bg-white/5" />
                  </div>
                  <Button onClick={handleCreate} disabled={createProject.isPending}>Publish</Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load projects." />}

      <div className="space-y-4">
        {projects?.map((project) => (
          <Link key={project.id} to={`${portalRoutes.labs}/${project.id}`}>
            <PortalCard className="p-5 transition hover:border-white/30 hover:bg-white/[0.07]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                      {project.status}
                    </Badge>
                    {project.tags.map((t) => (
                      <span key={t} className="text-xs text-white/40">#{t}</span>
                    ))}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{project.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/55">{project.description}</p>
                </div>
              </div>
            </PortalCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
