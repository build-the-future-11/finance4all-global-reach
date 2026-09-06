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
} from "@/hooks/portal/useAdmin";
import {
  useAccountDeletionRequests,
  useReviewAccountDeletionRequest,
} from "@/hooks/portal/useAccountLifecycle";
import {
  PortalCard,
  PortalPageHeader,
  portalInputClass,
  portalButtonOutline,
  CategoryBadge,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NewsCategory, OpportunityType } from "@/types/domain";
import type { AccountDeletionStatus } from "@/types/database";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function Admin() {
  const { data: news } = useNewsArticles();
  const { data: opportunities } = useOpportunities();
  const { data: events } = useEvents();
  const { data: explainers } = useExplainers();
  const { data: chapters } = useChapters();
  const { data: deletionRequests } = useAccountDeletionRequests();

  const createNews = useCreateNewsArticle();
  const createOpp = useCreateOpportunity();
  const createEvent = useCreateEvent();
  const createExplainer = useCreateExplainer();
  const deleteNews = useDeleteNewsArticle();
  const reviewDeletion = useReviewAccountDeletionRequest();

  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    category: "macro" as NewsCategory,
    tags: "",
    sourceUrl: "",
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
    startsAt: "",
    registrationUrl: "",
  });
  const [explainerForm, setExplainerForm] = useState({
    slug: "",
    title: "",
    summary: "",
    body: "",
    difficulty: "beginner" as "beginner" | "intermediate",
  });
  const [deletionReviews, setDeletionReviews] = useState<
    Record<string, { status: AccountDeletionStatus; reviewNote: string }>
  >({});

  const parseTags = (s: string) =>
    s.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Admin"
        title="Content management"
        description="Publish portal content and review member account-deletion requests."
      />

      <Tabs defaultValue="news" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-white/[0.04] p-1">
          <TabsTrigger value="news" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            News ({news?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            Opportunities ({opportunities?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            Events ({events?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="explainers" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            Explainers ({explainers?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="account-deletions" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            Account requests ({deletionRequests?.filter((request) => request.status === "pending" || request.status === "in_progress").length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-6">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">Publish article</h3>
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
                  <SelectContent>
                    {["macro", "markets", "ipo", "company"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
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
            </div>
            <Button
              className="mt-4 bg-emerald-500 hover:bg-emerald-400"
              disabled={createNews.isPending}
              onClick={async () => {
                try {
                  await createNews.mutateAsync({
                    ...newsForm,
                    tags: parseTags(newsForm.tags),
                    sourceUrl: newsForm.sourceUrl || undefined,
                  });
                  toast.success("Article published");
                  setNewsForm({ title: "", summary: "", category: "macro", tags: "", sourceUrl: "" });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
                }
              }}
            >
              Publish
            </Button>
          </PortalCard>
          <div className="space-y-2">
            {news?.map((a) => (
              <PortalCard key={a.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">{a.title}</p>
                  <CategoryBadge>{a.category}</CategoryBadge>
                </div>
                <Button size="icon" variant="ghost" className="text-red-400/70 hover:text-red-400" onClick={async () => {
                  try {
                    await deleteNews.mutateAsync(a.id);
                    toast.success("Deleted");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Failed");
                  }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PortalCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">Add opportunity</h3>
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
                  <SelectContent>
                    {["internship", "program", "challenge", "project_role"].map((t) => (
                      <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
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
            </div>
            <Button className="mt-4 bg-emerald-500 hover:bg-emerald-400" onClick={async () => {
              try {
                await createOpp.mutateAsync({ ...oppForm, tags: parseTags(oppForm.tags), applicationUrl: oppForm.applicationUrl || undefined });
                toast.success("Opportunity added");
                setOppForm({ title: "", organization: "", type: "internship", description: "", applicationUrl: "", tags: "" });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
            }}>
              Add opportunity
            </Button>
          </PortalCard>
        </TabsContent>

        <TabsContent value="events">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">Create event</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-white/70">Chapter</Label>
                <Select value={eventForm.chapterId} onValueChange={(v) => setEventForm({ ...eventForm, chapterId: v })}>
                  <SelectTrigger className={portalInputClass}><SelectValue placeholder="Select chapter" /></SelectTrigger>
                  <SelectContent>
                    {chapters?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Starts at</Label>
                <Input type="datetime-local" value={eventForm.startsAt} onChange={(e) => setEventForm({ ...eventForm, startsAt: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Title</Label>
                <Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className={portalInputClass} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white/70">Description</Label>
                <Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} className={portalInputClass} />
              </div>
            </div>
            <Button className="mt-4 bg-emerald-500 hover:bg-emerald-400" onClick={async () => {
              try {
                await createEvent.mutateAsync({
                  ...eventForm,
                  status: "upcoming",
                  startsAt: new Date(eventForm.startsAt).toISOString(),
                  registrationUrl: eventForm.registrationUrl || undefined,
                });
                toast.success("Event created");
                setEventForm({ chapterId: "", title: "", description: "", startsAt: "", registrationUrl: "" });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
            }}>
              Create event
            </Button>
          </PortalCard>
        </TabsContent>

        <TabsContent value="explainers">
          <PortalCard className="p-6">
            <h3 className="font-semibold text-white">Add explainer</h3>
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
            <Button className="mt-4 bg-emerald-500 hover:bg-emerald-400" onClick={async () => {
              try {
                await createExplainer.mutateAsync(explainerForm);
                toast.success("Explainer published");
                setExplainerForm({ slug: "", title: "", summary: "", body: "", difficulty: "beginner" });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
            }}>
              Publish explainer
            </Button>
          </PortalCard>
        </TabsContent>

        <TabsContent value="account-deletions" className="space-y-4">
          <PortalCard className="p-5">
            <h3 className="font-semibold text-white">Deletion review procedure</h3>
            <p className="mt-2 text-sm text-white/50">
              Mark a request in progress while verifying ownership and retention obligations. Use the privileged Supabase Auth deletion operation only after that review; deleting the Auth identity cascades the request and member-owned data. Reject or cancel requests that must not proceed.
            </p>
          </PortalCard>

          {deletionRequests?.length ? deletionRequests.map((request) => {
            const review = deletionReviews[request.id] ?? {
              status: request.status,
              reviewNote: request.review_note ?? "",
            };
            return (
              <PortalCard key={request.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{request.contact_email}</p>
                    <p className="mt-1 text-xs text-white/40">
                      Requested {new Date(request.requested_at).toLocaleString()} · {request.user_id}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs capitalize text-white/70">
                    {request.status.replace("_", " ")}
                  </span>
                </div>
                {request.reason && (
                  <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">
                    {request.reason}
                  </p>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]">
                  <Select
                    value={review.status}
                    onValueChange={(status) => setDeletionReviews((current) => ({
                      ...current,
                      [request.id]: { ...review, status: status as AccountDeletionStatus },
                    }))}
                  >
                    <SelectTrigger className={portalInputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["pending", "in_progress", "rejected", "cancelled"] as const).map((status) => (
                        <SelectItem key={status} value={status}>{status.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={review.reviewNote}
                    maxLength={2000}
                    placeholder="Review note (included in member export)"
                    className={portalInputClass}
                    onChange={(event) => setDeletionReviews((current) => ({
                      ...current,
                      [request.id]: { ...review, reviewNote: event.target.value },
                    }))}
                  />
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-400"
                    disabled={reviewDeletion.isPending}
                    onClick={async () => {
                      try {
                        await reviewDeletion.mutateAsync({
                          id: request.id,
                          status: review.status,
                          reviewNote: review.reviewNote,
                        });
                        toast.success("Account request updated");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed to update request");
                      }
                    }}
                  >
                    Save review
                  </Button>
                </div>
              </PortalCard>
            );
          }) : (
            <PortalCard className="p-8 text-center text-sm text-white/45">
              No account-deletion requests.
            </PortalCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
