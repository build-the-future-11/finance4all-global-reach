import { useCommunityStats } from "@/hooks/portal/useCommunityStats";

export default function CommunityPulse() {
  const { data: stats } = useCommunityStats();

  const items = [
    { label: "Members", value: stats?.members },
    { label: "Chapters", value: stats?.chapters },
    { label: "Open labs", value: stats?.openProjects },
    { label: "Introductions", value: stats?.introductions },
  ];

  return (
    <div className="flex flex-wrap gap-6 border border-white/10 bg-white/[0.02] px-5 py-4 rounded-xl">
      {items.map((item) => (
        <div key={item.label} className="min-w-[5rem]">
          <p className="text-xl font-semibold tabular-nums text-white">{item.value ?? "—"}</p>
          <p className="text-xs text-white/45">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
