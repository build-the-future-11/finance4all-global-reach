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
  useClientErrorEvents,
  useDigestDeliveryLog,
  useUpdateContactStatus,
  useAdminMembers,
  useProductAnalyticsEvents,
  useUpdateMemberRole,
  useSeedCmsContent,
  useCmsHealth,
  usePublishNewsArticle,
  useTransitionNewsStatus,
  useApprovedSources,
  useUpsertApprovedSource,
  useQueueDebriefAiGeneration,
  useDebriefAiLogs,
  useAdminStudioSubmissions,
  useAdminEssaySubmissions,
  useModerateStudioSubmission,
  useModerateEssaySubmission,
  useChapterLeaders,
  useAppointChapterLeader,
  useRemoveChapterLeader,
  useAdminCompetitions,
  useUpsertCompetition,
  useDeleteCompetition,
  useAdminResearchProjects,
  useNewsArticleVersions,
} from "@/hooks/portal/useAdmin";
import {
  useAdminContentReports,
  useResolveContentReport,
} from "@/hooks/portal/useSafety";
import { prepareDebriefAiQueue } from "@/lib/debriefAiAdapter";
import { canTransitionToStatus, DEBRIEF_DISCLAIMER } from "@/lib/debriefPublish";
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
import type {
  CompetitionStatus,
  EventStatus,
  NewsCategory,
  OpportunityType,
  UserRole,
} from "@/types/domain";
import { toast } from "sonner";
import { Activity, AlertTriangle, MailCheck, Pencil, Signal } from "lucide-react";
import { portalCopy } from "@/lib/portalCopy";
import { sanitizeTextInput, sanitizeTags, sanitizeOptionalUrl } from "@/lib/security";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import AdminConfirmDelete from "@/components/portal/AdminConfirmDelete";
import { useAuth } from "@/contexts/AuthContext";
import { moderationLabel, type SubmissionModerationStatus } from "@/lib/submissionModeration";
import { Badge } from "@/components/ui/badge";

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
  const publishNews = usePublishNewsArticle();
  const transitionNews = useTransitionNewsStatus();
  const { data: approvedSources } = useApprovedSources();
  const upsertSource = useUpsertApprovedSource();
  const queueAi = useQueueDebriefAiGeneration();
  const { data: aiLogs } = useDebriefAiLogs();
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
  const [aiPrompt, setAiPrompt] = useState("");
  const [sourceForm, setSourceForm] = useState({
    name: "",
    homepageUrl: "https://",
    allowedDomains: "",
    notes: "",
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    body: "",
    category: "macro" as NewsCategory,
    tags: "",
    sourceUrl: "",
    sourceId: "",
    topics: "",
    regions: "",
    importance: 3,
    newsletterInclude: false,
    aiAssisted: false,
  });
  const emptyNewsForm = {
    title: "",
    summary: "",
    body: "",
    category: "macro" as NewsCategory,
    tags: "",
    sourceUrl: "",
    sourceId: "",
    topics: "",
    regions: "",
    importance: 3,
    newsletterInclude: false,
    aiAssisted: false,
  };
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
          <PortalTabsTrigger value="moderation">Moderation</PortalTabsTrigger>
          <PortalTabsTrigger value="competitions">Competitions</PortalTabsTrigger>
          <PortalTabsTrigger value="labs">Labs</PortalTabsTrigger>
          <PortalTabsTrigger value="reports">Reports</PortalTabsTrigger>
          <PortalTabsTrigger value="inbox">Inbox</PortalTabsTrigger>
          <PortalTabsTrigger value="members">Members</PortalTabsTrigger>
          <PortalTabsTrigger value="system">System</PortalTabsTrigger>
        </PortalTabsList>

        <PortalTabsContent value="news" className="space-y-6">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">Approved sources</h3>
            <p className="mt-1 text-sm text-white/50">
              Finance Debrief articles can only be scheduled or published when bound to an active approved source.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                value={sourceForm.name}
                onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                placeholder="Source name"
                className={portalInputClass}
              />
              <Input
                value={sourceForm.homepageUrl}
                onChange={(e) => setSourceForm({ ...sourceForm, homepageUrl: e.target.value })}
                placeholder="https://example.com"
                className={portalInputClass}
              />
              <Input
                value={sourceForm.allowedDomains}
                onChange={(e) => setSourceForm({ ...sourceForm, allowedDomains: e.target.value })}
                placeholder="Domains (comma-separated)"
                className={portalInputClass}
              />
              <Input
                value={sourceForm.notes}
                onChange={(e) => setSourceForm({ ...sourceForm, notes: e.target.value })}
                placeholder="Editorial notes"
                className={portalInputClass}
              />
            </div>
            <Button
              className={cn("mt-3", portalButtonPrimary)}
              disabled={upsertSource.isPending || !sourceForm.name.trim() || !sourceForm.homepageUrl.startsWith("https://")}
              onClick={async () => {
                try {
                  await upsertSource.mutateAsync({
                    name: sourceForm.name,
                    homepageUrl: sourceForm.homepageUrl,
                    allowedDomains: sourceForm.allowedDomains.split(",").map((d) => d.trim()).filter(Boolean),
                    notes: sourceForm.notes,
                  });
                  toast.success("Approved source saved");
                  setSourceForm({ name: "", homepageUrl: "https://", allowedDomains: "", notes: "" });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to save source");
                }
              }}
            >
              Add approved source
            </Button>
            <div className="mt-4 flex flex-wrap gap-2">
              {(approvedSources ?? []).map((s) => (
                <Badge key={s.id} variant="outline" className={s.is_active ? "border-emerald-400/40 text-emerald-200" : "border-white/20 text-white/40"}>
                  {s.name}
                </Badge>
              ))}
            </div>
          </PortalCard>

          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">{editingNewsId ? "Edit Debrief draft" : "New Debrief draft"}</h3>
            <p className="mt-1 text-xs text-white/45">{DEBRIEF_DISCLAIMER}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-white/70">Title</Label>
                <Input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Summary</Label>
                <Textarea value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} rows={2} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Body</Label>
                <Textarea value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} rows={5} className={portalInputClass} />
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
                <Label className="text-white/70">Approved source</Label>
                <Select value={newsForm.sourceId || "none"} onValueChange={(v) => setNewsForm({ ...newsForm, sourceId: v === "none" ? "" : v })}>
                  <SelectTrigger className={portalInputClass}><SelectValue placeholder="Select source" /></SelectTrigger>
                  <PortalSelectContent>
                    <PortalSelectItem value="none">None (draft only)</PortalSelectItem>
                    {(approvedSources ?? []).filter((s) => s.is_active).map((s) => (
                      <PortalSelectItem key={s.id} value={s.id}>{s.name}</PortalSelectItem>
                    ))}
                  </PortalSelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Tags</Label>
                <Input value={newsForm.tags} onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Importance (1–5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newsForm.importance}
                  onChange={(e) => setNewsForm({ ...newsForm, importance: Number(e.target.value) || 3 })}
                  className={portalInputClass}
                />
              </div>
              <div>
                <Label className="text-white/70">Topics</Label>
                <Input value={newsForm.topics} onChange={(e) => setNewsForm({ ...newsForm, topics: e.target.value })} className={portalInputClass} />
              </div>
              <div>
                <Label className="text-white/70">Regions</Label>
                <Input value={newsForm.regions} onChange={(e) => setNewsForm({ ...newsForm, regions: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Canonical source URL</Label>
                <Input value={newsForm.sourceUrl} onChange={(e) => setNewsForm({ ...newsForm, sourceUrl: e.target.value })} className={portalInputClass} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 px-3 py-2">
                <Label htmlFor="news-newsletter" className="text-white/80">Include in newsletter</Label>
                <Switch id="news-newsletter" checked={newsForm.newsletterInclude} onCheckedChange={(newsletterInclude) => setNewsForm({ ...newsForm, newsletterInclude })} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 px-3 py-2">
                <Label htmlFor="news-ai" className="text-white/80">AI-assisted draft</Label>
                <Switch id="news-ai" checked={newsForm.aiAssisted} onCheckedChange={(aiAssisted) => setNewsForm({ ...newsForm, aiAssisted })} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className={cn(portalButtonPrimary)}
                disabled={createNews.isPending || updateNews.isPending || !newsForm.title.trim() || !newsForm.summary.trim()}
                onClick={async () => {
                  try {
                    const payload = {
                      title: newsForm.title,
                      summary: newsForm.summary,
                      body: newsForm.body,
                      category: newsForm.category,
                      tags: parseTags(newsForm.tags),
                      sourceUrl: sanitizeOptionalUrl(newsForm.sourceUrl),
                      sourceId: newsForm.sourceId || undefined,
                      topics: parseTags(newsForm.topics),
                      regions: parseTags(newsForm.regions),
                      importance: newsForm.importance,
                      newsletterInclude: newsForm.newsletterInclude,
                      aiAssisted: newsForm.aiAssisted,
                    };
                    if (editingNewsId) {
                      await updateNews.mutateAsync({ id: editingNewsId, ...payload });
                      toast.success("Draft saved");
                    } else {
                      await createNews.mutateAsync(payload);
                      toast.success("Draft created — publish only via Publish action");
                    }
                    setEditingNewsId(null);
                    setNewsForm(emptyNewsForm);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Failed");
                  }
                }}
              >
                {editingNewsId ? "Save draft" : "Create draft"}
              </Button>
              {editingNewsId && (
                <Button
                  variant="outline"
                  className={portalButtonOutline}
                  onClick={() => {
                    setEditingNewsId(null);
                    setNewsForm(emptyNewsForm);
                  }}
                >
                  Cancel edit
                </Button>
              )}
            </div>
            {editingNewsId && <AdminNewsVersionHistory articleId={editingNewsId} />}
          </PortalCard>

          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">Source-bound AI queue</h3>
            <p className="mt-1 text-sm text-white/50">
              Live model completion is owner-configured. Queuing always requires approved source ids; unsourced AI cannot publish.
            </p>
            <Textarea
              className={cn("mt-3", portalInputClass)}
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Prompt for a source-bound summary…"
            />
            <Button
              className={cn("mt-3", portalButtonOutline)}
              variant="outline"
              disabled={queueAi.isPending || !aiPrompt.trim() || !newsForm.sourceId}
              onClick={async () => {
                try {
                  const prepared = prepareDebriefAiQueue({
                    prompt: aiPrompt,
                    sourceIds: [newsForm.sourceId],
                    articleId: editingNewsId ?? undefined,
                  });
                  const logId = await queueAi.mutateAsync({
                    promptHash: prepared.promptHash,
                    sourceIds: [newsForm.sourceId],
                    articleId: editingNewsId ?? undefined,
                  });
                  toast.success(`${prepared.message} Log: ${logId.slice(0, 8)}…`);
                  setNewsForm({ ...newsForm, aiAssisted: true });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Queue failed");
                }
              }}
            >
              Queue AI generation
            </Button>
            <div className="mt-4 space-y-2">
              {(aiLogs ?? []).slice(0, 5).map((log) => (
                <p key={log.id} className="text-xs text-white/45">
                  {log.status} · {log.model} · {log.prompt_hash} · {new Date(log.created_at).toLocaleString()}
                </p>
              ))}
            </div>
          </PortalCard>

          {!news?.length ? (
            <EmptyState message={portalCopy.admin.emptyNews} />
          ) : (
            <div className="space-y-2">
              {news.map((a) => (
                <PortalDataRow key={a.id}>
                  <div className="min-w-0">
                    <p className="font-medium text-white">{a.title}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <CategoryBadge>{a.category}</CategoryBadge>
                      <Badge variant="outline" className="border-white/20 text-white/60">{a.status}</Badge>
                      {a.newsletterInclude && <Badge variant="outline" className="border-emerald-400/30 text-emerald-200">newsletter</Badge>}
                      {a.aiAssisted && <Badge variant="outline" className="border-amber-400/30 text-amber-200">AI-assisted</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
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
                          body: a.body ?? "",
                          category: a.category,
                          tags: a.tags.join(", "),
                          sourceUrl: a.sourceUrl ?? "",
                          sourceId: a.sourceId ?? "",
                          topics: a.topics?.join(", ") ?? "",
                          regions: a.regions?.join(", ") ?? "",
                          importance: a.importance ?? 3,
                          newsletterInclude: a.newsletterInclude ?? false,
                          aiAssisted: a.aiAssisted ?? false,
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {a.status !== "published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={portalButtonOutline}
                        disabled={publishNews.isPending}
                        onClick={async () => {
                          const guard = canTransitionToStatus({
                            status: "published",
                            sourceId: a.sourceId,
                            sourceIsActive: Boolean(approvedSources?.find((s) => s.id === a.sourceId)?.is_active),
                            aiAssisted: a.aiAssisted,
                            aiLogId: a.aiAssisted
                              ? aiLogs?.find((l) => l.article_id === a.id || !l.used_in_publish)?.id
                              : null,
                            aiLogUsedInPublish: true,
                          });
                          if (!guard.ok) {
                            toast.error(guard.errors[0]);
                            return;
                          }
                          try {
                            await publishNews.mutateAsync({
                              id: a.id,
                              aiLogId: a.aiAssisted
                                ? aiLogs?.find((l) => l.article_id === a.id || l.status === "queued" || l.status === "completed")?.id
                                : undefined,
                            });
                            toast.success("Published to members");
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Publish failed");
                          }
                        }}
                      >
                        Publish
                      </Button>
                    )}
                    {a.status === "published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={portalButtonOutline}
                        onClick={async () => {
                          try {
                            await transitionNews.mutateAsync({ id: a.id, status: "archived", changeNote: "Archived from admin" });
                            toast.success("Archived");
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Archive failed");
                          }
                        }}
                      >
                        Archive
                      </Button>
                    )}
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
          <AdminChapterLeadersPanel chapters={chapters ?? []} />
        </PortalTabsContent>

        <AdminModerationTab />
        <AdminCompetitionsTab />
        <AdminLabsTab />
        <AdminReportsTab />
        <AdminInboxTab />
        <AdminMembersTab />
        <AdminSystemTab />
      </Tabs>
    </div>
  );
}

function AdminNewsVersionHistory({ articleId }: { articleId: string }) {
  const { data, isLoading, error, refetch } = useNewsArticleVersions(articleId);
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <h4 className="text-sm font-medium text-white/80">Version history</h4>
      <QueryStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.length}
        emptyMessage="No versions recorded yet. Versions appear after publish and post-publish edits."
      >
        <ul className="mt-2 space-y-2">
          {data?.map((v) => (
            <li key={v.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
              <p className="text-white">
                v{v.version}
                {v.change_note ? ` — ${v.change_note}` : ""}
              </p>
              <p className="text-xs text-white/45">{new Date(v.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </QueryStatus>
    </div>
  );
}

function AdminLabsTab() {
  const { data, isLoading, error, refetch } = useAdminResearchProjects();
  return (
    <PortalTabsContent value="labs" className="space-y-4">
      <p className="text-sm text-white/50">
        Read-only overview of Meta Labs projects. Create and review applications remain in the lead
        researcher portal.
      </p>
      <QueryStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.length}
        emptyMessage="No research projects yet."
      >
        <div className="space-y-2">
          {data?.map((project) => (
            <PortalDataRow key={project.id}>
              <div>
                <p className="font-medium text-white">{project.title}</p>
                <p className="text-sm capitalize text-white/50">
                  {project.status}
                  {project.applicationDeadline
                    ? ` · deadline ${new Date(project.applicationDeadline).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <Badge variant="outline" className="border-white/20 text-white/60">
                {project.status}
              </Badge>
            </PortalDataRow>
          ))}
        </div>
      </QueryStatus>
    </PortalTabsContent>
  );
}

function AdminReportsTab() {
  const { data, isLoading, error, refetch } = useAdminContentReports();
  const resolve = useResolveContentReport();
  return (
    <PortalTabsContent value="reports" className="space-y-4">
      <p className="text-sm text-white/50">
        Member safety and spam reports. Resolve after review; youth-protection concerns should be
        prioritized.
      </p>
      <QueryStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.length}
        emptyMessage="No content reports yet."
      >
        <div className="space-y-3">
          {data?.map((report) => (
            <PortalCard key={report.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">
                    {report.target_type}
                    {report.target_id ? ` · ${report.target_id.slice(0, 8)}…` : ""}
                  </p>
                  <p className="mt-1 text-sm text-white/70">{report.reason}</p>
                  {report.details && (
                    <p className="mt-1 text-sm text-white/50">{report.details}</p>
                  )}
                  <p className="mt-2 text-xs text-white/40">
                    {new Date(report.created_at).toLocaleString()} · {report.status}
                  </p>
                </div>
                <Select
                  value={report.status}
                  onValueChange={async (status) => {
                    try {
                      await resolve.mutateAsync({
                        id: report.id,
                        status: status as "open" | "reviewing" | "resolved" | "dismissed",
                      });
                      toast.success("Report updated");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                >
                  <SelectTrigger className="w-36 border-white/20 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <PortalSelectContent>
                    {(["open", "reviewing", "resolved", "dismissed"] as const).map((s) => (
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

function AdminChapterLeadersPanel({
  chapters,
}: {
  chapters: { id: string; name: string; city: string; country: string }[];
}) {
  const { data: leaders, isLoading, error, refetch } = useChapterLeaders();
  const { data: members } = useAdminMembers();
  const appoint = useAppointChapterLeader();
  const remove = useRemoveChapterLeader();
  const [chapterId, setChapterId] = useState("");
  const [userId, setUserId] = useState("");
  const memberLabel = (id: string) => {
    const member = members?.find((m) => m.id === id);
    if (!member) return id;
    return `${member.displayName} (${member.email})`;
  };

  return (
    <PortalCard className="mt-6 space-y-4 p-4">
      <h3 className="font-medium text-white">Chapter leaders</h3>
      <p className="text-sm text-white/50">
        Appoint a verified chapter lead by selecting a member profile.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select value={chapterId} onValueChange={setChapterId}>
          <SelectTrigger className="border-white/20 bg-white/5 text-white">
            <SelectValue placeholder="Chapter" />
          </SelectTrigger>
          <PortalSelectContent>
            {chapters.map((c) => (
              <PortalSelectItem key={c.id} value={c.id}>
                {c.name}
              </PortalSelectItem>
            ))}
          </PortalSelectContent>
        </Select>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="border-white/20 bg-white/5 text-white">
            <SelectValue placeholder="Member" />
          </SelectTrigger>
          <PortalSelectContent>
            {(members ?? []).map((member) => (
              <PortalSelectItem key={member.id} value={member.id}>
                {member.displayName} · {member.email}
              </PortalSelectItem>
            ))}
          </PortalSelectContent>
        </Select>
        <Button
          className={portalButtonPrimary}
          disabled={!chapterId || !userId.trim() || appoint.isPending}
          onClick={async () => {
            try {
              await appoint.mutateAsync({ chapterId, userId: userId.trim(), role: "lead" });
              toast.success("Chapter leader appointed");
              setUserId("");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Appoint lead
        </Button>
      </div>
      <QueryStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!leaders?.length}
        emptyMessage="No chapter leaders appointed yet."
      >
        <div className="space-y-2">
          {leaders?.map((leader) => {
            const chapter = chapters.find((c) => c.id === leader.chapterId);
            return (
              <PortalDataRow key={`${leader.chapterId}-${leader.userId}`}>
                <div>
                  <p className="font-medium text-white">{chapter?.name ?? leader.chapterId}</p>
                  <p className="text-sm text-white/50">
                    {leader.role} · {memberLabel(leader.userId)}
                  </p>
                </div>
                <Button
                  type="button"
                  className={portalButtonDanger}
                  onClick={async () => {
                    try {
                      await remove.mutateAsync({
                        chapterId: leader.chapterId,
                        userId: leader.userId,
                      });
                      toast.success("Leader removed");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                >
                  Remove
                </Button>
              </PortalDataRow>
            );
          })}
        </div>
      </QueryStatus>
    </PortalCard>
  );
}

function AdminModerationTab() {
  const {
    data: studios,
    isLoading: studiosLoading,
    error: studiosError,
    refetch: refetchStudios,
  } = useAdminStudioSubmissions();
  const {
    data: essays,
    isLoading: essaysLoading,
    error: essaysError,
    refetch: refetchEssays,
  } = useAdminEssaySubmissions();
  const moderateStudio = useModerateStudioSubmission();
  const moderateEssay = useModerateEssaySubmission();

  return (
    <PortalTabsContent value="moderation" className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Studios</h3>
        <QueryStatus
          isLoading={studiosLoading}
          error={studiosError}
          onRetry={() => refetchStudios()}
          isEmpty={!studios?.length}
          emptyMessage="No studio submissions yet."
        >
          <div className="space-y-3">
            {studios?.map((studio) => (
              <PortalCard key={studio.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{studio.title}</p>
                    <p className="mt-1 line-clamp-3 text-sm text-white/60">{studio.writeup}</p>
                    <Badge variant="outline" className="mt-2 border-white/20 text-white/60">
                      {moderationLabel(studio.status)}
                    </Badge>
                  </div>
                  <Select
                    value={studio.status}
                    onValueChange={async (status) => {
                      try {
                        await moderateStudio.mutateAsync({
                          id: studio.id,
                          status: status as SubmissionModerationStatus,
                        });
                        toast.success("Studio moderation updated");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                  >
                    <SelectTrigger className="w-36 border-white/20 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <PortalSelectContent>
                      {(["pending", "approved", "rejected", "archived"] as const).map((s) => (
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
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Essays</h3>
        <QueryStatus
          isLoading={essaysLoading}
          error={essaysError}
          onRetry={() => refetchEssays()}
          isEmpty={!essays?.length}
          emptyMessage="No essay submissions yet."
        >
          <div className="space-y-3">
            {essays?.map((essay) => (
              <PortalCard key={essay.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{essay.title}</p>
                    <p className="mt-1 line-clamp-3 text-sm text-white/60">{essay.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-white/20 text-white/60">
                        {moderationLabel(essay.status)}
                      </Badge>
                      {essay.isEditorialPick && (
                        <Badge className="bg-emerald-500/20 text-emerald-200">Editorial pick</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Select
                      value={essay.status}
                      onValueChange={async (status) => {
                        try {
                          await moderateEssay.mutateAsync({
                            id: essay.id,
                            status: status as SubmissionModerationStatus,
                          });
                          toast.success("Essay moderation updated");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Failed");
                        }
                      }}
                    >
                      <SelectTrigger className="w-36 border-white/20 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <PortalSelectContent>
                        {(["pending", "approved", "rejected", "archived"] as const).map((s) => (
                          <PortalSelectItem key={s} value={s}>
                            {s}
                          </PortalSelectItem>
                        ))}
                      </PortalSelectContent>
                    </Select>
                    <Button
                      type="button"
                      className={portalButtonOutline}
                      disabled={essay.status !== "approved"}
                      onClick={async () => {
                        try {
                          await moderateEssay.mutateAsync({
                            id: essay.id,
                            status: "approved",
                            editorialPick: !essay.isEditorialPick,
                          });
                          toast.success(
                            essay.isEditorialPick ? "Editorial pick removed" : "Marked editorial pick",
                          );
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Failed");
                        }
                      }}
                    >
                      {essay.isEditorialPick ? "Remove pick" : "Editorial pick"}
                    </Button>
                  </div>
                </div>
              </PortalCard>
            ))}
          </div>
        </QueryStatus>
      </section>
    </PortalTabsContent>
  );
}

function AdminCompetitionsTab() {
  const { data, isLoading, error, refetch } = useAdminCompetitions();
  const upsert = useUpsertCompetition();
  const remove = useDeleteCompetition();
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft" as CompetitionStatus,
    startsAt: "",
    endsAt: "",
    registrationUrl: "",
  });

  return (
    <PortalTabsContent value="competitions" className="space-y-6">
      <PortalCard className="space-y-4 p-4">
        <h3 className="font-medium text-white">Create competition</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-white/70">Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={portalInputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-white/70">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={portalInputClass}
              rows={4}
            />
          </div>
          <div>
            <Label className="text-white/70">Status</Label>
            <Select
              value={form.status}
              onValueChange={(status) => setForm({ ...form, status: status as CompetitionStatus })}
            >
              <SelectTrigger className="border-white/20 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <PortalSelectContent>
                {(["draft", "open", "closed", "archived"] as const).map((s) => (
                  <PortalSelectItem key={s} value={s}>
                    {s}
                  </PortalSelectItem>
                ))}
              </PortalSelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/70">Registration URL</Label>
            <Input
              value={form.registrationUrl}
              onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
              className={portalInputClass}
            />
          </div>
        </div>
        <Button
          className={portalButtonPrimary}
          disabled={upsert.isPending || !form.title.trim() || form.description.trim().length < 20}
          onClick={async () => {
            try {
              await upsert.mutateAsync({
                title: sanitizeTextInput(form.title, 160),
                description: sanitizeTextInput(form.description, 5000),
                status: form.status,
                registrationUrl: sanitizeOptionalUrl(form.registrationUrl) ?? undefined,
              });
              toast.success("Competition saved");
              setForm({
                title: "",
                description: "",
                status: "draft",
                startsAt: "",
                endsAt: "",
                registrationUrl: "",
              });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Add competition
        </Button>
      </PortalCard>

      <QueryStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.length}
        emptyMessage="No competitions yet. Create one above — open status listings appear for members under Events & Chapters."
      >
        <div className="space-y-2">
          {data?.map((comp) => (
            <PortalDataRow key={comp.id}>
              <div>
                <p className="font-medium text-white">{comp.title}</p>
                <p className="text-sm capitalize text-white/50">{comp.status}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className={portalButtonOutline}
                  onClick={async () => {
                    try {
                      await upsert.mutateAsync({
                        id: comp.id,
                        title: comp.title,
                        description: comp.description,
                        status: comp.status === "open" ? "closed" : "open",
                        registrationUrl: comp.registrationUrl,
                      });
                      toast.success("Competition status updated");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                >
                  {comp.status === "open" ? "Close" : "Open"}
                </Button>
                <AdminConfirmDelete
                  label={comp.title}
                  onConfirm={async () => {
                    try {
                      await remove.mutateAsync(comp.id);
                      toast.success("Competition deleted");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                />
              </div>
            </PortalDataRow>
          ))}
        </div>
      </QueryStatus>
    </PortalTabsContent>
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

function AdminSystemTab() {
  const analytics = useProductAnalyticsEvents();
  const errors = useClientErrorEvents();
  const digests = useDigestDeliveryLog();
  const cmsHealth = useCmsHealth();
  const seedCms = useSeedCmsContent();
  const isLoading = analytics.isLoading || errors.isLoading || digests.isLoading || cmsHealth.isLoading;
  const error = analytics.error ?? errors.error ?? digests.error ?? cmsHealth.error;

  const eventCounts = (analytics.data ?? []).reduce<Record<string, number>>((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] ?? 0) + 1;
    return acc;
  }, {});
  const totalEvents = analytics.data?.length ?? 0;
  const recentErrors = errors.data?.length ?? 0;
  const sentDigests = digests.data?.filter((row) => row.status === "sent").length ?? 0;
  const failedDigests = digests.data?.filter((row) => row.status === "failed").length ?? 0;

  return (
    <PortalTabsContent value="system" className="space-y-4">
      <QueryStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          void analytics.refetch();
          void errors.refetch();
          void digests.refetch();
          void cmsHealth.refetch();
        }}
        isEmpty={!totalEvents && !recentErrors && !digests.data?.length && cmsHealth.data?.initialized}
        emptyMessage="No operational events have been recorded yet."
      >
        <PortalCard className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-white">CMS content</h3>
              <p className="mt-1 text-sm text-white/55">
                {cmsHealth.data?.initialized
                  ? "Education, resources, webinars, and testimonials are loaded in the database."
                  : "Seed the default curriculum and resource library into Supabase (migration 008 required)."}
              </p>
            </div>
            <Button
              type="button"
              className={cn(portalButtonPrimary)}
              disabled={seedCms.isPending}
              onClick={async () => {
                try {
                  await seedCms.mutateAsync();
                  toast.success("CMS content seeded");
                  void cmsHealth.refetch();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not seed CMS content");
                }
              }}
            >
              {seedCms.isPending ? "Seeding…" : cmsHealth.data?.initialized ? "Re-seed CMS" : "Seed CMS content"}
            </Button>
          </div>
        </PortalCard>

        <div className="grid gap-3 md:grid-cols-4">
          <SystemMetric icon={Signal} label="Tracked events" value={totalEvents.toLocaleString()} />
          <SystemMetric icon={Activity} label="Event types" value={Object.keys(eventCounts).length.toString()} />
          <SystemMetric icon={AlertTriangle} label="Recent client errors" value={recentErrors.toLocaleString()} tone={recentErrors ? "warn" : "default"} />
          <SystemMetric icon={MailCheck} label="Digest deliveries" value={`${sentDigests} sent / ${failedDigests} failed`} tone={failedDigests ? "warn" : "default"} />
        </div>

        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Product events</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(eventCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <div key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="break-words text-sm font-medium text-white">{name}</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-200">{count}</p>
                </div>
              ))}
          </div>
          <div className="mt-5 space-y-2">
            {(analytics.data ?? []).slice(0, 12).map((event) => (
              <PortalDataRow key={event.id}>
                <div className="min-w-0">
                  <p className="break-words font-medium text-white">{event.event_name}</p>
                  <p className="text-sm text-white/50">{new Date(event.occurred_at).toLocaleString()}</p>
                </div>
                <p className="max-w-md break-words text-right text-xs text-white/45">
                  {formatSystemJson(event.properties)}
                </p>
              </PortalDataRow>
            ))}
          </div>
        </PortalCard>

        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Client error reports</h3>
          <div className="mt-4 space-y-2">
            {(errors.data ?? []).length ? (
              errors.data?.map((item) => (
                <PortalDataRow key={item.id}>
                  <div className="min-w-0">
                    <p className="break-words font-medium text-white">{item.error_name}</p>
                    <p className="break-words text-sm text-white/60">{item.message}</p>
                  </div>
                  <p className="text-right text-xs text-white/45">{new Date(item.occurred_at).toLocaleString()}</p>
                </PortalDataRow>
              ))
            ) : (
              <p className="text-sm text-white/45">No client errors have been reported.</p>
            )}
          </div>
        </PortalCard>

        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Digest delivery log</h3>
          <div className="mt-4 space-y-2">
            {(digests.data ?? []).length ? (
              digests.data?.map((item) => (
                <PortalDataRow key={item.id}>
                  <div>
                    <p className="font-medium capitalize text-white">{item.status}</p>
                    <p className="text-sm text-white/50">
                      Week of {new Date(item.period_start).toLocaleDateString()} · {item.article_count} articles
                    </p>
                  </div>
                  <p className="max-w-sm break-words text-right text-xs text-white/45">
                    {item.error_message ?? new Date(item.sent_at).toLocaleString()}
                  </p>
                </PortalDataRow>
              ))
            ) : (
              <p className="text-sm text-white/45">No digest attempts have been logged.</p>
            )}
          </div>
        </PortalCard>
      </QueryStatus>
    </PortalTabsContent>
  );
}

function SystemMetric({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <PortalCard className="p-4">
      <div className="flex items-center gap-2 text-white/55">
        <Icon className={cn("h-4 w-4", tone === "warn" ? "text-amber-300" : "text-emerald-300")} aria-hidden />
        <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-3 break-words text-2xl font-semibold text-white">{value}</p>
    </PortalCard>
  );
}

function formatSystemJson(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  try {
    const text = JSON.stringify(value);
    return text.length > 120 ? `${text.slice(0, 117)}...` : text;
  } catch {
    return "";
  }
}
