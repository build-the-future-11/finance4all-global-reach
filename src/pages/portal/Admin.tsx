import { useState } from "react";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useOpportunities } from "@/hooks/portal/usePathways";
import { useChapters, useEvents } from "@/hooks/portal/useEvents";
import { useExplainers } from "@/hooks/portal/useDebriefed";
import {
  useCreateNewsArticle,
  useCreateOpportunity,
  useCreateEvent,
  useCreateExplainer,
  useDeleteNewsArticle,
  useUpdateNewsArticle,
  useDeleteOpportunity,
  useUpdateOpportunity,
  useDeleteEvent,
  useUpdateEvent,
  useDeleteExplainer,
  useUpdateExplainer,
  useCreateChapter,
  useDeleteChapter,
  useContactSubmissions,
  useUpdateContactStatus,
  useAdminMembers,
  useUpdateMemberRole,
} from "@/hooks/portal/useAdmin";
import {
  PortalCard,
  PortalDataRow,
  PortalPageHeader,
  portalInputClass,
  portalButtonOutline,
  portalButtonPrimary,
  portalButtonDanger,
  CategoryBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  PortalTabsList,
  PortalTabsTrigger,
  PortalTabsContent,
  PortalSelectContent,
  PortalSelectItem,
  QueryStatus,
} from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventStatus, NewsCategory, OpportunityType, UserRole } from "@/types/domain";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { portalCopy } from "@/lib/portalCopy";
import { sanitizeTextInput, sanitizeTags, sanitizeOptionalUrl } from "@/lib/security";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import AdminConfirmDelete from "@/components/portal/AdminConfirmDelete";
import { useAuth } from "@/contexts/AuthContext";

export default function Admin() {
  const { data: news, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useNewsArticles();
  const {
    data: opportunities,
    isLoading: oppsLoading,
    error: oppsError,
    refetch: refetchOpps,
  } = useOpportunities();
  const { data: events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents();
  const {
    data: explainers,
    isLoading: explainersLoading,
    error: explainersError,
    refetch: refetchExplainers,
  } = useExplainers();
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError, refetch: refetchChapters } =
    useChapters();

  const createNews = useCreateNewsArticle();
  const createOpp = useCreateOpportunity();
  const createEvent = useCreateEvent();
  const createExplainer = useCreateExplainer();
  const createChapter = useCreateChapter();
  const deleteNews = useDeleteNewsArticle();
  const updateNews = useUpdateNewsArticle();
  const deleteOpp = useDeleteOpportunity();
  const updateOpp = useUpdateOpportunity();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();
  const deleteExplainer = useDeleteExplainer();
  const updateExplainer = useUpdateExplainer();
  const deleteChapter = useDeleteChapter();

  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingExplainerId, setEditingExplainerId] = useState<string | null>(null);

  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    category: "macro" as NewsCategory,
    tags: "",
    sourceUrl: "",
    isPublished: true,
  });
  const [oppForm, setOppForm] = useState({
    title: "",
    organization: "",
    type: "internship" as OpportunityType,
    description: "",
    applicationUrl: "",
    tags: "",
  });
  const [eventForm, setEventForm] = useState({
    chapterId: "",
    title: "",
    description: "",
    status: "upcoming" as EventStatus,
    startsAt: "",
    endsAt: "",
    registrationUrl: "",
    registrationOpensAt: "",
    registrationClosesAt: "",
    registrationCapacity: "",
  });
  const [explainerForm, setExplainerForm] = useState({
    slug: "",
    title: "",
    summary: "",
    body: "",
    difficulty: "beginner" as "beginner" | "intermediate",
  });
  const [chapterForm, setChapterForm] = useState({
    name: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
  });

  const parseTags = (s: string) => sanitizeTags(s);

  const isLoading =
    newsLoading || oppsLoading || eventsLoading || explainersLoading || chaptersLoading;
  const loadError = newsError ?? oppsError ?? eventsError ?? explainersError ?? chaptersError;

  const refetchAll = () => {
    void refetchNews();
    void refetchOpps();
    void refetchEvents();
    void refetchExplainers();
    void refetchChapters();
  };

  if (isLoading) {
    return (
      <div>
        <PortalAnimatedSection>
          <PortalPageHeader
            eyebrow={portalCopy.admin.eyebrow}
            title={portalCopy.admin.title}
            description={portalCopy.admin.description}
          />
        </PortalAnimatedSection>
        <LoadingState />
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <PortalAnimatedSection>
          <PortalPageHeader
            eyebrow={portalCopy.admin.eyebrow}
            title={portalCopy.admin.title}
            description={portalCopy.admin.description}
          />
        </PortalAnimatedSection>
        <ErrorState
          message={loadError instanceof Error ? loadError.message : portalCopy.admin.loadError}
          onRetry={refetchAll}
        />
      </div>
    );
  }

  return (
    <div>
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.admin.eyebrow}
          title={portalCopy.admin.title}
          description={portalCopy.admin.description}
        />
      </PortalAnimatedSection>

      <Tabs defaultValue="news" className="space-y-6">
        <PortalTabsList>
          <PortalTabsTrigger value="news">News ({news?.length ?? 0})</PortalTabsTrigger>
          <PortalTabsTrigger value="opportunities">
            Opportunities ({opportunities?.length ?? 0})
          </PortalTabsTrigger>
          <PortalTabsTrigger value="events">Events ({events?.length ?? 0})</PortalTabsTrigger>
          <PortalTabsTrigger value="explainers">
            Explainers ({explainers?.length ?? 0})
          </PortalTabsTrigger>
          <PortalTabsTrigger value="chapters">Chapters ({chapters?.length ?? 0})</PortalTabsTrigger>
          <PortalTabsTrigger value="inbox">Inbox</PortalTabsTrigger>
          <PortalTabsTrigger value="members">Members</PortalTabsTrigger>
        </PortalTabsList>

        <PortalTabsContent value="news" className="space-y-6">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">{editingNewsId ? "Edit article" : "Publish article"}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-white/70">Title</Label>
                <Input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Summary</Label>
                <Textarea value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} rows={2} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Category</Label>
                <Select value={newsForm.category} onValueChange={(v) => setNewsForm({ ...newsForm, category: v as NewsCategory })}>
                  <SelectTrigger className={portalInputClass}><SelectValue /></SelectTrigger>
                  <PortalSelectContent>
                    {["macro", "markets", "ipo", "company"].map((c) => (
                      <PortalSelectItem key={c} value={c}>{c}</PortalSelectItem>
                    ))}
                  </PortalSelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Tags (comma-separated)</Label>
                <Input value={newsForm.tags} onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Source URL (optional)</Label>
                <Input value={newsForm.sourceUrl} onChange={(e) => setNewsForm({ ...newsForm, sourceUrl: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-lg border border-white/10 px-3 py-2">
                <div>
                  <Label htmlFor="news-published" className="text-white/80">Visible to members</Label>
                  <p className="mt-1 text-xs text-white/45">Turn this off to save a draft only administrators can view.</p>
                </div>
                <Switch id="news-published" checked={newsForm.isPublished} onCheckedChange={(isPublished) => setNewsForm({ ...newsForm, isPublished })} />
              </div>
            </div>
            <Button
              className={cn("mt-4", portalButtonPrimary)}
              disabled={createNews.isPending || updateNews.isPending || !newsForm.title.trim() || !newsForm.summary.trim()}
              onClick={async () => {
                try {
                  const payload = {
                    title: sanitizeTextInput(newsForm.title, 200),
                    summary: sanitizeTextInput(newsForm.summary, 500),
                    category: newsForm.category,
                    tags: parseTags(newsForm.tags),
                    sourceUrl: sanitizeOptionalUrl(newsForm.sourceUrl),
                    isPublished: newsForm.isPublished,
                  };
                  if (editingNewsId) {
                    await updateNews.mutateAsync({ id: editingNewsId, ...payload });
                    toast.success("Article updated");
                    setEditingNewsId(null);
                  } else {
                    await createNews.mutateAsync(payload);
                    toast.success("Article published");
                  }
                  setNewsForm({ title: "", summary: "", category: "macro", tags: "", sourceUrl: "", isPublished: true });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
                }
              }}
            >
              {editingNewsId ? "Save changes" : "Publish"}
            </Button>
            {editingNewsId && (
              <Button
                variant="outline"
                className={cn("ml-2 mt-4", portalButtonOutline)}
                onClick={() => {
                  setEditingNewsId(null);
                  setNewsForm({ title: "", summary: "", category: "macro", tags: "", sourceUrl: "", isPublished: true });
                }}
              >
                Cancel edit
              </Button>
            )}
          </PortalCard>
          {!news?.length ? (
            <EmptyState message={portalCopy.admin.emptyNews} />
          ) : (
          <div className="space-y-2">
            {news.map((a) => (
              <PortalDataRow key={a.id}>
                <div>
                  <p className="font-medium text-white">{a.title}</p>
                  <CategoryBadge>{a.category}</CategoryBadge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                    aria-label={`Edit ${a.title}`}
                    onClick={() => {
                      setEditingNewsId(a.id);
                      setNewsForm({
                        title: a.title,
                        summary: a.summary,
                        category: a.category,
                        tags: a.tags.join(", "),
                        sourceUrl: a.sourceUrl ?? "",
                        isPublished: a.isPublished,
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AdminConfirmDelete
                    label={a.title}
                    onConfirm={async () => {
                      try {
                        await deleteNews.mutateAsync(a.id);
                        toast.success("Deleted");
                        if (editingNewsId === a.id) setEditingNewsId(null);
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                  />
                </div>
              </PortalDataRow>
            ))}
          </div>
          )}
        </PortalTabsContent>

        <PortalTabsContent value="opportunities">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">{editingOppId ? "Edit opportunity" : "Add opportunity"}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-white/70">Title</Label>
                <Input value={oppForm.title} onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Organization</Label>
                <Input value={oppForm.organization} onChange={(e) => setOppForm({ ...oppForm, organization: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Type</Label>
                <Select value={oppForm.type} onValueChange={(v) => setOppForm({ ...oppForm, type: v as OpportunityType })}>
                  <SelectTrigger className={portalInputClass}><SelectValue /></SelectTrigger>
                  <PortalSelectContent>
                    {["internship", "program", "challenge", "project_role"].map((t) => (
                      <PortalSelectItem key={t} value={t}>{t.replace("_", " ")}</PortalSelectItem>
                    ))}
                  </PortalSelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Application URL</Label>
                <Input value={oppForm.applicationUrl} onChange={(e) => setOppForm({ ...oppForm, applicationUrl: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Description</Label>
                <Textarea value={oppForm.description} onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })} rows={3} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Tags (comma-separated)</Label>
                <Input value={oppForm.tags} onChange={(e) => setOppForm({ ...oppForm, tags: e.target.value })} className={portalInputClass} />
              </div>
            </div>
            <Button className={cn("mt-4", portalButtonPrimary)} disabled={createOpp.isPending || updateOpp.isPending || !oppForm.title.trim()} onClick={async () => {
              try {
                const payload = {
                  title: sanitizeTextInput(oppForm.title, 200),
                  organization: sanitizeTextInput(oppForm.organization, 200),
                  type: oppForm.type,
                  description: sanitizeTextInput(oppForm.description, 1000),
                  tags: parseTags(oppForm.tags),
                  applicationUrl: sanitizeOptionalUrl(oppForm.applicationUrl),
                };
                if (editingOppId) {
                  await updateOpp.mutateAsync({ id: editingOppId, ...payload });
                  toast.success("Opportunity updated");
                  setEditingOppId(null);
                } else {
                  await createOpp.mutateAsync(payload);
                  toast.success("Opportunity added");
                }
                setOppForm({ title: "", organization: "", type: "internship", description: "", applicationUrl: "", tags: "" });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
            }}>
              {editingOppId ? "Save changes" : "Add opportunity"}
            </Button>
            {editingOppId && (
              <Button variant="outline" className={cn("ml-2 mt-4", portalButtonOutline)} onClick={() => {
                setEditingOppId(null);
                setOppForm({ title: "", organization: "", type: "internship", description: "", applicationUrl: "", tags: "" });
              }}>
                Cancel edit
              </Button>
            )}
          </PortalCard>
          {!opportunities?.length ? (
            <EmptyState message={portalCopy.admin.emptyOpportunities} />
          ) : (
          <div className="space-y-2">
            {opportunities.map((o) => (
              <PortalDataRow key={o.id}>
                <div>
                  <p className="font-medium text-white">{o.title}</p>
                  <p className="text-sm text-white/50">{o.organization}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" aria-label={`Edit ${o.title}`} onClick={() => {
                    setEditingOppId(o.id);
                    setOppForm({
                      title: o.title,
                      organization: o.organization,
                      type: o.type,
                      description: o.description,
                      applicationUrl: o.applicationUrl ?? "",
                      tags: o.tags.join(", "),
                    });
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AdminConfirmDelete label={o.title} onConfirm={async () => {
                    try {
                      await deleteOpp.mutateAsync(o.id);
                      toast.success("Deleted");
                      if (editingOppId === o.id) setEditingOppId(null);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }} />
                </div>
              </PortalDataRow>
            ))}
          </div>
          )}
        </PortalTabsContent>

        <PortalTabsContent value="events">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">{editingEventId ? "Edit event" : "Create event"}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-white/70">Chapter</Label>
                <Select value={eventForm.chapterId} onValueChange={(v) => setEventForm({ ...eventForm, chapterId: v })}>
                  <SelectTrigger className={portalInputClass}><SelectValue placeholder="Select chapter" /></SelectTrigger>
                  <PortalSelectContent>
                    {chapters?.map((c) => (
                      <PortalSelectItem key={c.id} value={c.id}>{c.name}</PortalSelectItem>
                    ))}
                  </PortalSelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Starts at</Label>
                <Input type="datetime-local" value={eventForm.startsAt} onChange={(e) => setEventForm({ ...eventForm, startsAt: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Ends at (optional)</Label>
                <Input type="datetime-local" value={eventForm.endsAt} onChange={(e) => setEventForm({ ...eventForm, endsAt: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Status</Label>
                <Select value={eventForm.status} onValueChange={(value) => setEventForm({ ...eventForm, status: value as EventStatus })}>
                  <SelectTrigger className={portalInputClass}><SelectValue /></SelectTrigger>
                  <PortalSelectContent>
                    {(["upcoming", "live", "completed"] as const).map((status) => <PortalSelectItem key={status} value={status}>{status}</PortalSelectItem>)}
                  </PortalSelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Title</Label>
                <Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Description</Label>
                <Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Registration URL (optional)</Label>
                <Input value={eventForm.registrationUrl} onChange={(e) => setEventForm({ ...eventForm, registrationUrl: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Registration opens (optional)</Label>
                <Input type="datetime-local" value={eventForm.registrationOpensAt} onChange={(e) => setEventForm({ ...eventForm, registrationOpensAt: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Registration closes (optional)</Label>
                <Input type="datetime-local" value={eventForm.registrationClosesAt} onChange={(e) => setEventForm({ ...eventForm, registrationClosesAt: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Registration capacity (optional)</Label>
                <Input type="number" min="1" step="1" value={eventForm.registrationCapacity} onChange={(e) => setEventForm({ ...eventForm, registrationCapacity: e.target.value })} className={portalInputClass} />
              </div>
            </div>
            <Button className={cn("mt-4", portalButtonPrimary)} disabled={createEvent.isPending || updateEvent.isPending || !eventForm.title.trim() || !eventForm.chapterId || !eventForm.startsAt} onClick={async () => {
              try {
                const payload = {
                  chapterId: eventForm.chapterId,
                  title: sanitizeTextInput(eventForm.title, 200),
                  description: sanitizeTextInput(eventForm.description, 1000),
                  status: eventForm.status,
                  startsAt: eventForm.startsAt,
                  endsAt: eventForm.endsAt || undefined,
                  registrationUrl: sanitizeOptionalUrl(eventForm.registrationUrl),
                  registrationOpensAt: eventForm.registrationOpensAt || undefined,
                  registrationClosesAt: eventForm.registrationClosesAt || undefined,
                  registrationCapacity: eventForm.registrationCapacity ? Number(eventForm.registrationCapacity) : undefined,
                };
                if (editingEventId) {
                  await updateEvent.mutateAsync({ id: editingEventId, ...payload });
                  toast.success("Event updated");
                  setEditingEventId(null);
                } else {
                  await createEvent.mutateAsync(payload);
                  toast.success("Event created");
                }
                setEventForm({ chapterId: "", title: "", description: "", status: "upcoming", startsAt: "", endsAt: "", registrationUrl: "", registrationOpensAt: "", registrationClosesAt: "", registrationCapacity: "" });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
            }}>
              {editingEventId ? "Save changes" : "Create event"}
            </Button>
            {editingEventId && (
              <Button variant="outline" className={cn("ml-2 mt-4", portalButtonOutline)} onClick={() => {
                setEditingEventId(null);
                setEventForm({ chapterId: "", title: "", description: "", status: "upcoming", startsAt: "", endsAt: "", registrationUrl: "", registrationOpensAt: "", registrationClosesAt: "", registrationCapacity: "" });
              }}>
                Cancel edit
              </Button>
            )}
          </PortalCard>
          {!events?.length ? (
            <EmptyState message={portalCopy.admin.emptyEvents} />
          ) : (
          <div className="space-y-2">
            {events.map((ev) => (
              <PortalDataRow key={ev.id}>
                <div>
                  <p className="font-medium text-white">{ev.title}</p>
                  <p className="text-sm text-white/50">
                    {new Date(ev.startsAt).toLocaleString()} · {ev.status}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" aria-label={`Edit ${ev.title}`} onClick={() => {
                    setEditingEventId(ev.id);
                    setEventForm({
                      chapterId: ev.chapterId,
                      title: ev.title,
                      description: ev.description,
                      status: ev.status,
                      startsAt: ev.startsAt.slice(0, 16),
                      endsAt: ev.endsAt?.slice(0, 16) ?? "",
                      registrationUrl: ev.registrationUrl ?? "",
                      registrationOpensAt: ev.registrationOpensAt?.slice(0, 16) ?? "",
                      registrationClosesAt: ev.registrationClosesAt?.slice(0, 16) ?? "",
                      registrationCapacity: ev.registrationCapacity?.toString() ?? "",
                    });
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AdminConfirmDelete label={ev.title} onConfirm={async () => {
                    try {
                      await deleteEvent.mutateAsync(ev.id);
                      toast.success("Deleted");
                      if (editingEventId === ev.id) setEditingEventId(null);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }} />
                </div>
              </PortalDataRow>
            ))}
          </div>
          )}
        </PortalTabsContent>

        <PortalTabsContent value="explainers">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">{editingExplainerId ? "Edit explainer" : "Add explainer"}</h3>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-white/70">Slug (URL)</Label>
                  <Input value={explainerForm.slug} onChange={(e) => setExplainerForm({ ...explainerForm, slug: e.target.value })} placeholder="what-is-an-ipo" className={portalInputClass} />
                </div>
                <div>
                  <Label className="text-white/70">Title</Label>
                  <Input value={explainerForm.title} onChange={(e) => setExplainerForm({ ...explainerForm, title: e.target.value })} className={portalInputClass} />
                </div>
              </div>
              <div>
                <Label className="text-white/70">Summary</Label>
                <Input value={explainerForm.summary} onChange={(e) => setExplainerForm({ ...explainerForm, summary: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Body (markdown)</Label>
                <Textarea value={explainerForm.body} onChange={(e) => setExplainerForm({ ...explainerForm, body: e.target.value })} rows={8} className={portalInputClass} />
              </div>
            </div>
            <Button className={cn("mt-4", portalButtonPrimary)} disabled={createExplainer.isPending || updateExplainer.isPending || !explainerForm.slug.trim() || !explainerForm.title.trim()} onClick={async () => {
              try {
                const payload = {
                  slug: sanitizeTextInput(explainerForm.slug, 100),
                  title: sanitizeTextInput(explainerForm.title, 200),
                  summary: sanitizeTextInput(explainerForm.summary, 500),
                  body: explainerForm.body,
                  difficulty: explainerForm.difficulty,
                };
                if (editingExplainerId) {
                  await updateExplainer.mutateAsync({ id: editingExplainerId, ...payload });
                  toast.success("Explainer updated");
                  setEditingExplainerId(null);
                } else {
                  await createExplainer.mutateAsync(payload);
                  toast.success("Explainer published");
                }
                setExplainerForm({ slug: "", title: "", summary: "", body: "", difficulty: "beginner" });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
            }}>
              {editingExplainerId ? "Save changes" : "Publish explainer"}
            </Button>
            {editingExplainerId && (
              <Button variant="outline" className={cn("ml-2 mt-4", portalButtonOutline)} onClick={() => {
                setEditingExplainerId(null);
                setExplainerForm({ slug: "", title: "", summary: "", body: "", difficulty: "beginner" });
              }}>
                Cancel edit
              </Button>
            )}
          </PortalCard>
          {!explainers?.length ? (
            <EmptyState message={portalCopy.admin.emptyExplainers} />
          ) : (
          <div className="space-y-2">
            {explainers.map((ex) => (
              <PortalDataRow key={ex.id}>
                <div>
                  <p className="font-medium text-white">{ex.title}</p>
                  <p className="text-sm text-white/50">{ex.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" aria-label={`Edit ${ex.title}`} onClick={() => {
                    setEditingExplainerId(ex.id);
                    setExplainerForm({
                      slug: ex.slug,
                      title: ex.title,
                      summary: ex.summary,
                      body: ex.body,
                      difficulty: ex.difficulty,
                    });
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AdminConfirmDelete label={ex.title} onConfirm={async () => {
                    try {
                      await deleteExplainer.mutateAsync(ex.id);
                      toast.success("Deleted");
                      if (editingExplainerId === ex.id) setEditingExplainerId(null);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }} />
                </div>
              </PortalDataRow>
            ))}
          </div>
          )}
        </PortalTabsContent>

        <PortalTabsContent value="chapters" className="space-y-6">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">Add chapter</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-white/70">Chapter name</Label>
                <Input
                  value={chapterForm.name}
                  onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                  className={portalInputClass}
                />
              </div>
              <div>
                <Label className="text-white/70">City</Label>
                <Input
                  value={chapterForm.city}
                  onChange={(e) => setChapterForm({ ...chapterForm, city: e.target.value })}
                  className={portalInputClass}
                />
              </div>
              <div>
                <Label className="text-white/70">Country</Label>
                <Input
                  value={chapterForm.country}
                  onChange={(e) => setChapterForm({ ...chapterForm, country: e.target.value })}
                  className={portalInputClass}
                />
              </div>
              <div>
                <Label className="text-white/70">Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={chapterForm.latitude}
                  onChange={(e) => setChapterForm({ ...chapterForm, latitude: e.target.value })}
                  className={portalInputClass}
                />
              </div>
              <div>
                <Label className="text-white/70">Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={chapterForm.longitude}
                  onChange={(e) => setChapterForm({ ...chapterForm, longitude: e.target.value })}
                  className={portalInputClass}
                />
              </div>
            </div>
            <Button
              className={cn("mt-4", portalButtonPrimary)}
              disabled={
                createChapter.isPending ||
                !chapterForm.name.trim() ||
                !chapterForm.city.trim() ||
                !chapterForm.country.trim() ||
                !chapterForm.latitude ||
                !chapterForm.longitude
              }
              onClick={async () => {
                const latitude = Number(chapterForm.latitude);
                const longitude = Number(chapterForm.longitude);
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                  toast.error("Enter valid coordinates.");
                  return;
                }
                try {
                  await createChapter.mutateAsync({
                    name: sanitizeTextInput(chapterForm.name, 120),
                    city: sanitizeTextInput(chapterForm.city, 80),
                    country: sanitizeTextInput(chapterForm.country, 80),
                    latitude,
                    longitude,
                  });
                  toast.success("Chapter created");
                  setChapterForm({ name: "", city: "", country: "", latitude: "", longitude: "" });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
                }
              }}
            >
              Add chapter
            </Button>
          </PortalCard>
          {!chapters?.length ? (
            <EmptyState message={portalCopy.admin.emptyChapters} />
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <PortalDataRow key={chapter.id}>
                  <div>
                    <p className="font-medium text-white">{chapter.name}</p>
                    <p className="text-sm text-white/50">
                      {chapter.city}, {chapter.country} · {chapter.memberCount} members
                    </p>
                  </div>
                  <AdminConfirmDelete
                    label={chapter.name}
                    onConfirm={async () => {
                      try {
                        await deleteChapter.mutateAsync(chapter.id);
                        toast.success("Chapter deleted");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                  />
                </PortalDataRow>
              ))}
            </div>
          )}
        </PortalTabsContent>

        <AdminInboxTab />
        <AdminMembersTab />
      </Tabs>
    </div>
  );
}

function AdminInboxTab() {
  const { data, isLoading, error, refetch } = useContactSubmissions();
  const updateStatus = useUpdateContactStatus();

  return (
    <PortalTabsContent value="inbox" className="space-y-4">
      <QueryStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.length}
        emptyMessage={portalCopy.admin.emptyInbox}
      >
        <div className="space-y-3">
          {data?.map((msg) => (
            <PortalCard key={msg.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{msg.subject}</p>
                  <p className="text-sm text-white/50">
                    {msg.name} · {msg.email} · {new Date(msg.created_at).toLocaleString()}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{msg.message}</p>
                </div>
                <Select
                  value={msg.status}
                  onValueChange={async (status) => {
                    try {
                      await updateStatus.mutateAsync({
                        id: msg.id,
                        status: status as "new" | "read" | "archived",
                      });
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                >
                  <SelectTrigger className="w-32 border-white/20 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <PortalSelectContent>
                    {(["new", "read", "archived"] as const).map((s) => (
                      <PortalSelectItem key={s} value={s}>
                        {s}
                      </PortalSelectItem>
                    ))}
                  </PortalSelectContent>
                </Select>
              </div>
            </PortalCard>
          ))}
        </div>
      </QueryStatus>
    </PortalTabsContent>
  );
}

function AdminMembersTab() {
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = useAdminMembers();
  const updateRole = useUpdateMemberRole();

  return (
    <PortalTabsContent value="members" className="space-y-4">
      <QueryStatus isLoading={isLoading} error={error} onRetry={() => refetch()} isEmpty={!data?.length}>
        <div className="space-y-2">
          {data?.map((member) => (
            <PortalDataRow key={member.id}>
              <div>
                <p className="font-medium text-white">{member.displayName}</p>
                <p className="text-sm text-white/50">{member.email}</p>
              </div>
              <Select
                value={member.role}
                disabled={member.id === profile?.id || updateRole.isPending}
                onValueChange={async (role) => {
                  try {
                    await updateRole.mutateAsync({ userId: member.id, role: role as UserRole });
                    toast.success(portalCopy.admin.memberRoleUpdated);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Failed");
                  }
                }}
              >
                <SelectTrigger className="w-40 border-white/20 bg-white/5 capitalize text-white">
                  <SelectValue />
                </SelectTrigger>
                <PortalSelectContent>
                  {(["member", "lead_researcher", "admin"] as const).map((r) => (
                    <PortalSelectItem key={r} value={r}>
                      {r.replace("_", " ")}
                    </PortalSelectItem>
                  ))}
                </PortalSelectContent>
              </Select>
            </PortalDataRow>
          ))}
        </div>
      </QueryStatus>
    </PortalTabsContent>
  );
}
