import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chapterStatuses } from "@/content/community";
import { supabase } from "@/lib/supabase";
import { verifiedChapterStatus } from "@/lib/chapter-status";
import { requireOptionalExternalHttpUrl } from "@/lib/external-url";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";
import { PortalCard } from "@/components/portal/PortalUI";
import type { Tables } from "@/types/database";

const blank = { name: "", city: "", country: "", latitude: "", longitude: "", chapterStatus: "unverified", acceptedOwner: false, permissionsConfirmed: false, evidenceUrl: "", lastActivity: "" };
type ChapterDraft = { form: typeof blank; editing?: Tables<"chapters"> };
export default function ChapterEditor() {
  const qc = useQueryClient();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Tables<"chapters">>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);
  const records = useQuery({ queryKey: ["admin-chapter-records"], queryFn: async () => { const result = await supabase.from("chapters").select("*").order("name").limit(100); if (result.error) throw result.error; return result.data; } });
  const mutation = useMutation({ mutationFn: async ({ form, editing }: ChapterDraft) => {
    const latitude = Number(form.latitude), longitude = Number(form.longitude);
    if (!form.name.trim() || !form.city.trim() || !form.country.trim() || !form.latitude || !form.longitude || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error("Supply a chapter name, city, country and valid geographic coordinates.");
    const evidence = { chapter_status: form.chapterStatus, accepted_owner: form.acceptedOwner, permissions_confirmed: form.permissionsConfirmed, operating_evidence_url: requireOptionalExternalHttpUrl(form.evidenceUrl, "Operating evidence URL") ?? null, last_activity_at: form.lastActivity ? new Date(`${form.lastActivity}T00:00:00Z`).toISOString() : null };
    if (form.chapterStatus === "active_verified" && verifiedChapterStatus(evidence) !== "active_verified") throw new Error("Active status requires an accepted accountable owner, confirmed local permissions and evidence of a real activity within the last 45 days.");
    const row = { name: form.name.trim(), city: form.city.trim(), country: form.country.trim(), latitude, longitude, ...evidence };
    const result = editing ? await supabase.from("chapters").update(row).eq("id", editing.id).eq("publication_revision", editing.publication_revision).select("id").maybeSingle() : await supabase.from("chapters").insert({ ...row, id: crypto.randomUUID(), member_count: 0 }).select("id").single();
    requireConfirmedRow(result, "Saving the chapter draft");
  }, onSuccess: async () => { await qc.invalidateQueries(); } });
  const select = (id: string) => { const record = records.data?.find(item => item.id === id); setEditing(record); setMessage(""); setError(""); setForm(record ? { name: record.name, city: record.city, country: record.country, latitude: String(record.latitude), longitude: String(record.longitude), chapterStatus: record.chapter_status ?? "unverified", acceptedOwner: record.accepted_owner ?? false, permissionsConfirmed: record.permissions_confirmed ?? false, evidenceUrl: record.operating_evidence_url ?? "", lastActivity: record.last_activity_at?.slice(0, 10) ?? "" } : blank); };
  const inputClass = "mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm";
  return <PortalCard className="mt-6 p-6"><details><summary className="cursor-pointer text-xl font-semibold">Maintain chapter records</summary><p className="my-4 text-sm text-muted-foreground">Admin-only chapter maintenance preserves review and revision controls. Maps never treat publication alone as active status. Keep participant names and private records out of public display fields.</p>
    {records.isError && <p role="alert">Chapter records could not be loaded. <button className="underline" type="button" onClick={() => void records.refetch()}>Retry</button></p>}
    <label className="block text-sm">Chapter record<select className={inputClass} value={editing?.id ?? ""} disabled={mutation.isPending} onChange={event => select(event.target.value)}><option value="">Create chapter draft</option>{records.data?.map(record => <option key={record.id} value={record.id}>{record.name} · {record.publication_state}</option>)}</select></label>
    <form className="mt-5 space-y-4" onSubmit={async event => { event.preventDefault(); if (lock.current) return; lock.current = true; setError(""); setMessage(""); try { await mutation.mutateAsync({ form: { ...form }, editing }); setEditing(undefined); setForm(blank); setMessage("Chapter draft saved. Review the current revision in Publication review."); } catch (failure) { setError(failure instanceof Error ? failure.message : "The chapter could not be saved."); } finally { lock.current = false; } }}>
      <fieldset disabled={mutation.isPending} className="grid gap-4 sm:grid-cols-2">{([ ["name", "Chapter name"], ["city", "City"], ["country", "Country / territory"], ["latitude", "Latitude"], ["longitude", "Longitude"], ["evidenceUrl", "Operating evidence URL"] ] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}<input className={inputClass} type={key === "evidenceUrl" ? "url" : "text"} required={key !== "evidenceUrl"} value={form[key]} onChange={event => setForm(value => ({ ...value, [key]: event.target.value }))} /></label>)}
        <label className="block text-sm">Operating status<select className={inputClass} value={form.chapterStatus} onChange={event => setForm(value => ({ ...value, chapterStatus: event.target.value }))}>{Object.entries(chapterStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="block text-sm">Last evidenced activity date (UTC)<input className={inputClass} type="date" value={form.lastActivity} onChange={event => setForm(value => ({ ...value, lastActivity: event.target.value }))} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.acceptedOwner} onChange={event => setForm(value => ({ ...value, acceptedOwner: event.target.checked }))} />Accountable owner accepted</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.permissionsConfirmed} onChange={event => setForm(value => ({ ...value, permissionsConfirmed: event.target.checked }))} />Local permissions confirmed</label>
      </fieldset>
      <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground" type="submit" disabled={mutation.isPending || records.isError}>{mutation.isPending ? "Saving…" : "Save chapter draft for review"}</button>
      {error && <p role="alert" className="text-sm">{error}</p>}{message && <p role="status" className="text-sm">{message}</p>}
    </form></details></PortalCard>;
}
