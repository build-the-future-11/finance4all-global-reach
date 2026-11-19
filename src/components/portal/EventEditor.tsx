import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";
import { requireOptionalExternalHttpUrl } from "@/lib/external-url";
import { isValidTimezone } from "@/lib/event-calendar";
import { EventDetailsSchema, EventStatusSchema, type EventDetails } from "@/types/domain";
import { PortalCard } from "@/components/portal/PortalUI";
import type { Tables } from "@/types/database";

const blank = { chapterId: "", title: "", description: "", startsAt: "", endsAt: "", registrationUrl: "", publicListing: false, host: "", timezone: "UTC", type: "workshop", modality: "unconfirmed", location: "", audience: "", sourceUrl: "", relatedProgram: "", registrationOpensAt: "", registrationClosesAt: "", scheduleState: "confirmed", status: "upcoming", recordingUrl: "" };
type EventDraft = { form: typeof blank; editing?: Tables<"events"> };
// Inputs are explicitly UTC. Browser timezone must never silently change an
// organizer's submitted timestamp or be mistaken for their IANA timezone.
function utcInput(value: string) { return value ? new Date(`${value.replace(/Z$/, "")}Z`).toISOString() : undefined; }
export default function EventEditor() {
  const qc = useQueryClient();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Tables<"events">>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);
  const records = useQuery({ queryKey: ["admin-event-records"], queryFn: async () => { const result = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(100); if (result.error) throw result.error; return result.data; } });
  const chapters = useQuery({ queryKey: ["admin-chapter-records"], queryFn: async () => { const result = await supabase.from("chapters").select("*").order("name").limit(100); if (result.error) throw result.error; return result.data; } });
  const mutation = useMutation({ mutationFn: async ({ form, editing }: EventDraft) => {
    if (!form.title.trim() || !form.description.trim() || !form.chapterId) throw new Error("Supply a title, description and reviewed chapter record.");
    const startsAt = utcInput(form.startsAt), endsAt = utcInput(form.endsAt);
    if (!startsAt) throw new Error("A confirmed start timestamp is required for a scheduled event record. Keep unscheduled program plans in the program catalog.");
    if (endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) throw new Error("The end must be later than the start.");
    if (!isValidTimezone(form.timezone)) throw new Error("Supply a valid IANA organizer timezone, such as Europe/Rome.");
    const sourceUrl = requireOptionalExternalHttpUrl(form.sourceUrl, "Official evidence URL");
    if (form.publicListing && (!endsAt || !sourceUrl || !form.host.trim())) throw new Error("Public event discovery requires a confirmed end, host and official evidence URL before review.");
    const details = EventDetailsSchema.parse({ host: form.host.trim() || undefined, timezone: form.timezone, type: form.type, modality: form.modality, location: form.location.trim() || undefined, audience: form.audience.trim() || undefined, sourceUrl, relatedProgram: form.relatedProgram.trim() || undefined, registrationOpensAt: utcInput(form.registrationOpensAt), registrationClosesAt: utcInput(form.registrationClosesAt), scheduleState: form.scheduleState, recordingUrl: requireOptionalExternalHttpUrl(form.recordingUrl, "Recording URL"), verifiedAt: new Date().toISOString() });
    if (details.registrationOpensAt && details.registrationClosesAt && Date.parse(details.registrationOpensAt) >= Date.parse(details.registrationClosesAt)) throw new Error("Registration must close after it opens.");
    const row = { chapter_id: form.chapterId, title: form.title.trim(), description: form.description.trim(), starts_at: startsAt, ends_at: endsAt ?? null, status: EventStatusSchema.parse(form.status), registration_url: requireOptionalExternalHttpUrl(form.registrationUrl, "Registration URL") ?? null, event_details: { ...(editing?.event_details && typeof editing.event_details === "object" && !Array.isArray(editing.event_details) ? editing.event_details : {}), ...details }, public_listing: form.publicListing };
    const result = editing
      ? await supabase.from("events").update(row).eq("id", editing.id).eq("publication_revision", editing.publication_revision).select("id").maybeSingle()
      : await supabase.from("events").insert(row).select("id").single();
    requireConfirmedRow(result, "Saving this event draft");
  }, onSuccess: async () => { await qc.invalidateQueries(); } });
  const selectRecord = (id: string) => {
    setMessage(""); setError("");
    const record = records.data?.find(event => event.id === id); setEditing(record);
    if (!record) { setForm(blank); return; }
    const parsed = EventDetailsSchema.safeParse(record.event_details ?? {});
    const details: EventDetails = parsed.success ? parsed.data : {};
    setForm({ ...blank, chapterId: record.chapter_id, title: record.title, description: record.description, status: record.status, startsAt: new Date(record.starts_at).toISOString().slice(0, 16), endsAt: record.ends_at ? new Date(record.ends_at).toISOString().slice(0, 16) : "", registrationUrl: record.registration_url ?? "", publicListing: record.public_listing ?? false, ...Object.fromEntries(Object.entries(details).filter(([key]) => key in blank)), registrationOpensAt: details.registrationOpensAt ? new Date(details.registrationOpensAt).toISOString().slice(0, 16) : "", registrationClosesAt: details.registrationClosesAt ? new Date(details.registrationClosesAt).toISOString().slice(0, 16) : "" });
  };
  const inputClass = "mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm";
  const field = (key: Exclude<keyof typeof blank, "publicListing">, label: string, type = "text", required = false) => <label className="block text-sm" key={key}>{label}<input className={inputClass} type={type} required={required} value={form[key]} onChange={event => setForm(value => ({ ...value, [key]: event.target.value }))} /></label>;
  return <PortalCard className="space-y-5 p-6"><h3 className="text-xl font-semibold">Maintain event records</h3><p className="text-sm text-muted-foreground">Saving creates or revises a draft. The publication queue separately approves the current revision. Only explicitly public, reviewed events with a published chapter reach anonymous discovery.</p>
    {records.isError || chapters.isError ? <p role="alert">Event editing records could not be loaded. <button type="button" className="underline" onClick={() => { void records.refetch(); void chapters.refetch(); }}>Retry</button></p> : <label className="block text-sm">Choose a record<select className={inputClass} value={editing?.id ?? ""} disabled={mutation.isPending} onChange={event => selectRecord(event.target.value)}><option value="">Create a new scheduled event</option>{records.data?.map(record => <option key={record.id} value={record.id}>{record.title} · {record.publication_state}</option>)}</select></label>}
    <form className="space-y-5" onSubmit={async event => { event.preventDefault(); if (lock.current) return; lock.current = true; setMessage(""); setError(""); try { await mutation.mutateAsync({ form: { ...form }, editing }); setMessage("Event draft saved. Review its current revision in Publication review before publishing."); setEditing(undefined); setForm(blank); } catch (failure) { setError(failure instanceof Error ? failure.message : "The event could not be saved."); } finally { lock.current = false; } }}>
      <fieldset disabled={mutation.isPending} className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">Chapter<select className={inputClass} required value={form.chapterId} onChange={event => setForm(value => ({ ...value, chapterId: event.target.value }))}><option value="">Select a chapter record</option>{chapters.data?.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.name} · {chapter.publication_state}</option>)}</select></label>
        {field("title", "Event title", "text", true)}
        <label className="block text-sm sm:col-span-2">Description<textarea className={inputClass} required rows={4} value={form.description} onChange={event => setForm(value => ({ ...value, description: event.target.value }))} /></label>
        {field("startsAt", "Confirmed start (UTC)", "datetime-local", true)}{field("endsAt", "Confirmed end (UTC)", "datetime-local")}{field("timezone", "Organizer IANA timezone", "text", true)}{field("host", "Actual host organization")}
        <label className="block text-sm">Event type<select className={inputClass} value={form.type} onChange={event => setForm(value => ({ ...value, type: event.target.value }))}>{["workshop", "webinar", "seminar", "competition", "conference", "chapter", "editorial", "other"].map(type => <option key={type}>{type}</option>)}</select></label>
        <label className="block text-sm">Format<select className={inputClass} value={form.modality} onChange={event => setForm(value => ({ ...value, modality: event.target.value }))}>{["online", "in_person", "hybrid", "unconfirmed"].map(type => <option key={type}>{type}</option>)}</select></label>
        <label className="block text-sm">Schedule state<select className={inputClass} value={form.scheduleState} onChange={event => setForm(value => ({ ...value, scheduleState: event.target.value }))}>{["confirmed", "on_hold", "cancelled", "awaiting_schedule"].map(type => <option key={type}>{type.replaceAll("_", " ")}</option>)}</select></label>
        <label className="block text-sm">Event status<select className={inputClass} value={form.status} onChange={event => setForm(value => ({ ...value, status: event.target.value }))}>{EventStatusSchema.options.map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select><span className="mt-1 block text-xs text-muted-foreground">When rescheduling a live or completed event, explicitly select Upcoming to allow registration after review. Date and schedule checks still apply.</span></label>
        {field("location", "Venue or online location")}{field("audience", "Audience and eligibility")}{field("sourceUrl", "Official evidence URL", "url")}{field("registrationUrl", "Approved registration URL", "url")}{field("relatedProgram", "Related program slug")}{field("registrationOpensAt", "Registration opens (UTC)", "datetime-local")}{field("registrationClosesAt", "Registration closes (UTC)", "datetime-local")}{field("recordingUrl", "Authorized recording URL", "url")}
        <label className="flex items-start gap-3 text-sm sm:col-span-2"><input className="mt-1" type="checkbox" checked={form.publicListing} onChange={event => setForm(value => ({ ...value, publicListing: event.target.checked }))} /><span>Request public event discovery after approval. Verify rights to publish every event field and link. This does not publish the draft.</span></label>
      </fieldset>
      <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground" disabled={mutation.isPending || records.isError || chapters.isError}>{mutation.isPending ? "Saving…" : "Save event draft for review"}</button>
      {error && <p role="alert" className="text-sm">{error}</p>}{message && <p role="status" className="text-sm">{message}</p>}
    </form>
  </PortalCard>;
}
