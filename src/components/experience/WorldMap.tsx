import { useId, useMemo, useState } from "react";
import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import { worldLandPaths } from "@/data/worldLand";
import type { CommunityLocation } from "@/content/community";
import "./world-map.css";

function mapPoint(latitude: number, longitude: number) {
  return { x: (longitude + 180) * 1000 / 360, y: (85 - latitude) * 1000 / 360 };
}

export function WorldOutline() {
  return <svg viewBox="0 0 1000 430" fill="currentColor" aria-hidden="true">{worldLandPaths.map((d, i) => <path d={d} key={i} />)}</svg>;
}

export default function WorldMap({ locations, selectedId, onSelect, label = "Our community around the world", description = "Explore the cities in our community. Locations are not a count of operating chapters." }: {
  locations: CommunityLocation[]; selectedId?: string; onSelect?: (id: string | undefined) => void; label?: string; description?: string;
}) {
  const [localSelected, setLocalSelected] = useState<string>();
  const [region, setRegion] = useState("All regions");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 500, y: 215 });
  const id = useId();
  const selected = locations.find(location => location.id === (onSelect ? selectedId : localSelected));
  const regions = [...new Set(locations.map(location => location.continent).filter(Boolean))];
  const filtered = useMemo(() => locations.filter(location => (region === "All regions" || location.continent === region) && `${location.city} ${location.country}`.toLowerCase().includes(search.toLowerCase())), [locations, region, search]);
  const select = (location: CommunityLocation) => {
    setLocalSelected(location.id); onSelect?.(location.id);
    setCenter(mapPoint(location.latitude, location.longitude));
    setZoom(2.5);
  };
  const reset = () => { setZoom(1); setCenter({ x: 500, y: 215 }); setLocalSelected(undefined); onSelect?.(undefined); setRegion("All regions"); setSearch(""); };
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
          {filtered.filter(l => Number.isFinite(l.latitude) && Number.isFinite(l.longitude) && Math.abs(l.latitude) <= 90 && Math.abs(l.longitude) <= 180).map(location => {
            const point = mapPoint(location.latitude, location.longitude);
            const active = selected?.id === location.id;
            return <g key={location.id} transform={`translate(${point.x}, ${point.y})`} role="button" tabIndex={0} aria-label={`${location.city}, ${location.country}`} aria-pressed={active} className="world-map-pin" data-selected={active} onClick={() => select(location)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(location); } }}>
              <circle r={11 / zoom} fill="transparent" /><circle className="map-pin-halo" r={7 / zoom} /><circle className="map-pin-core" r={3 / zoom} /><title>{location.city}, {location.country}</title>
            </g>;
          })}
        </svg>
        <div className="world-map-zoom"><button type="button" aria-label="Zoom in" disabled={zoom >= 5} onClick={() => setZoom(z => Math.min(5, z + 1))}><Plus size={17} /></button><button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - 1))}><Minus size={17} /></button></div>
        <span className="world-map-credit">Geography: <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth</a></span>
        {selected && <div className="world-map-selection" aria-live="polite"><strong>{selected.city}</strong><span>{selected.country}</span>{selected.description && <p>{selected.description}</p>}</div>}
      </div>
      <div className="world-map-directory"><label className="world-map-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a city or country" aria-label="Find a city or country" /></label><label className="sr-only" htmlFor={`${id}-region`}>Filter by region</label><select id={`${id}-region`} value={region} onChange={e => setRegion(e.target.value)}><option>All regions</option>{regions.map(r => <option key={r}>{r}</option>)}</select><div className="world-map-list" aria-label="Locations">{filtered.map(location => <button type="button" key={location.id} aria-label={`Explore ${location.city}, ${location.country}`} aria-pressed={selected?.id === location.id} onClick={() => select(location)}><span>{location.city}<small>{location.country}</small></span><span aria-hidden="true">↗</span></button>)}{!filtered.length && <p>No locations match. Try another city or region.</p>}</div></div>
    </div>
  </div>;
}
