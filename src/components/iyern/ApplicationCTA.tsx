import { normalizeExternalHttpUrl } from "@/lib/external-url";
/** Supply a URL only after the form and its intake permissions are approved. */
export default function ApplicationCTA({ approvedUrl, label, pending }: { approvedUrl?: string; label: string; pending: string }) {
  const url = normalizeExternalHttpUrl(approvedUrl);
  return url?.startsWith("https:") ? <a className="ffa-button" href={url} target="_blank" rel="noreferrer">{label} ↗</a> : <div className="iy-pending"><button className="ffa-button" disabled>{label}</button><p>{pending}</p></div>;
}
