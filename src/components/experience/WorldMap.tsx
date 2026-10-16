import { useId, useMemo, useState } from "react";
import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import { worldLandPaths } from "@/data/worldLand";
import { chapterStatuses, type CommunityLocation } from "@/content/community";
import "./world-map.css";

function mapPoint(latitude: number, longitude: number) {
  return { x: (longitude + 180) * 1000 / 360, y: (85 - latitude) * 1000 / 360 };
}

export function WorldOutline() {
  return <svg viewBox="0 0 1000 430" fill="currentColor" aria-hidden="true">{worldLandPaths.map((d, i) => <path d={d} key={i} />)}</svg>;
}

export default function WorldMap({ locations, selectedId, onSelect, label = "Our community around the world", description = "Explore proposed community locations. Expansion interest does not establish an operating chapter." }: {
  locations: CommunityLocation[]; selectedId?: string; onSelect?: (id: string | undefined) => void; label?: string; description?: string;
}) {
  const [localSelected, setLocalSelected] = useState<string>();
  const [region, setRegion] = useState("All regions");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All countries");
  const [status, setStatus] = useState("All statuses");
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 500, y: 215 });
  const id = useId();
  const selected = locations.find(location => location.id === (onSelect ? selectedId : localSelected));
  const regions = [...new Set(locations.map(location => location.continent).filter(Boolean))];
  const countries = [...new Set(locations.filter(location => region === "All regions" || location.continent === region).map(location => location.country))].sort();
  const filtered = useMemo(() => locations.filter(location =>
    (region === "All regions" || location.continent === region) &&
    (country === "All countries" || location.country === country) &&
    (status === "All statuses" || (location.status ?? "unverified") === status) &&
    `${location.city} ${location.country}`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(search.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase())
  ), [locations, region, country, status, search]);
  const clusters = useMemo(() => {
    const groups = new Map<string, CommunityLocation[]>();
    for (const location of filtered) {
      if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude) || Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) continue;
      const point = mapPoint(location.latitude, location.longitude);
      const key = zoom >= 4 ? location.id : `${Math.floor(point.x * zoom / 22)}-${Math.floor(point.y * zoom / 22)}`;
      groups.set(key, [...(groups.get(key) ?? []), location]);
    }
    return [...groups.values()];
  }, [filtered, zoom]);
  const select = (location: CommunityLocation) => {
    setLocalSelected(location.id); onSelect?.(location.id);
    setCenter(mapPoint(location.latitude, location.longitude));
    setZoom(2.5);
  };
  const reset = () => { setZoom(1); setCenter({ x: 500, y: 215 }); setLocalSelected(undefined); onSelect?.(undefined); setRegion("All regions"); setCountry("All countries"); setStatus("All statuses"); setSearch(""); };
  const width = 1000 / zoom, height = 430 / zoom;
  const x = Math.max(0, Math.min(1000 - width, center.x - width / 2));
  const y = Math.max(0, Math.min(430 - height, center.y - height / 2));
  return <div className="world-map">
    <div className="world-map-toolbar"><div><h3>{label}</h3><p>{description}</p></div><button type="button" onClick={reset}><RotateCcw size={14} /> Reset view</button></div>
    <div className="world-map-layout">
      <div className="world-map-canvas">
        <svg viewBox={`${x} ${y} ${width} ${height}`} role="group" aria-label="Interactive world map. Use the location list to explore cities.">
          <defs><pattern id={`${id}-dots`} width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="currentColor" opacity=".18" /></pattern></defs>
          <rect width="1000" height="430" fill={`url(#${id}-dots)`} />
          <g className="world-map-land">{worldLandPaths.map((d, i) => <path d={d} key={i} />)}</g>
          {clusters.map(group => {
            const location = group[0];
            if (group.length > 1) {
              const point = group.reduce((center, item) => { const p = mapPoint(item.latitude, item.longitude); return { x: center.x + p.x / group.length, y: center.y + p.y / group.length }; }, { x: 0, y: 0 });
              const expand = () => { setCenter(point); setZoom(z => Math.min(5, z + 2)); };
              return <g key={group.map(item => item.id).join("-")} role="button" tabIndex={0} className="world-map-pin" aria-label={`Zoom into ${group.length} locations: ${group.map(item => item.city).join(", ")}`} transform={`translate(${point.x}, ${point.y})`} onClick={expand} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); expand(); } }}><circle r={11 / zoom} fill="#d9ff8a" /><text fill="#0d2922" fontSize={11 / zoom} textAnchor="middle" dominantBaseline="central">{group.length}</text></g>;
            }
            const point = mapPoint(location.latitude, location.longitude);
            const active = selected?.id === location.id;
            return <g key={location.id} transform={`translate(${point.x}, ${point.y})`} role="button" tabIndex={0} aria-label={`${location.city}, ${location.country}: ${chapterStatuses[location.status ?? "unverified"]}`} aria-pressed={active} className="world-map-pin" data-selected={active} onClick={() => select(location)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(location); } }}>
              <circle r={11 / zoom} fill="transparent" /><circle className="map-pin-halo" r={7 / zoom} /><circle className="map-pin-core" r={3 / zoom} /><title>{location.city}, {location.country}</title>
            </g>;
          })}
        </svg>
        <div className="world-map-zoom"><button type="button" aria-label="Zoom in" disabled={zoom >= 5} onClick={() => setZoom(z => Math.min(5, z + 1))}><Plus size={17} /></button><button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - 1))}><Minus size={17} /></button></div>
        <span className="world-map-credit">Geography: <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth</a></span>
        {selected && <div className="world-map-selection" aria-live="polite"><strong>{selected.city}</strong><span>{selected.country}</span><span>{chapterStatuses[selected.status ?? "unverified"]}</span>{selected.description && <p>{selected.description}</p>}</div>}
      </div>
      <div className="world-map-directory"><label className="world-map-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a city or country" aria-label="Find a city or country" /></label><label className="sr-only" htmlFor={`${id}-region`}>Filter by region</label><select id={`${id}-region`} value={region} onChange={e => { setRegion(e.target.value); setCountry("All countries"); }}><option>All regions</option>{regions.map(r => <option key={r}>{r}</option>)}</select><label className="sr-only" htmlFor={`${id}-country`}>Filter by country</label><select id={`${id}-country`} value={country} onChange={e => setCountry(e.target.value)}><option>All countries</option>{countries.map(value => <option key={value}>{value}</option>)}</select><label className="sr-only" htmlFor={`${id}-status`}>Filter by chapter status</label><select id={`${id}-status`} value={status} onChange={e => setStatus(e.target.value)}><option>All statuses</option>{Object.entries(chapterStatuses).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select><p className="mt-3 text-xs text-muted-foreground" role="status">{filtered.length} locations · numbered markers group nearby cities.</p><div className="world-map-list" aria-label="Locations">{filtered.map(location => <button type="button" key={location.id} aria-label={`Explore ${location.city}, ${location.country}`} aria-pressed={selected?.id === location.id} onClick={() => select(location)}><span>{location.city}<small>{location.country}</small><small>{chapterStatuses[location.status ?? "unverified"]}</small></span><span aria-hidden="true">↗</span></button>)}{!filtered.length && <p>No locations match. Try another city or region.</p>}</div></div>
    </div>
  </div>;
}
