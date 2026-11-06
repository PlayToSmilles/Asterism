// SPDX-License-Identifier: MPL-2.0
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Entity } from "../../domain/model";
import { OrbitalParticles } from "../canvas/OrbitalParticles";
import { orbitalLink } from "../canvas/constellationGeometry";
import { possibilities, type PossibilityId } from "./possibilities";
import type { SparkDraft } from "./sparkDraft";
import { SparkArtwork } from "./SparkArtwork";

export function PossibilityMap({ central, paths, active, choose }: {
  central: Entity; paths: SparkDraft["paths"]; active: boolean; choose: (id: PossibilityId) => void;
}) {
  const map = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, coreWidth: 0, coreHeight: 0, coreRadius: 0 });
  const [focus, setFocus] = useState<PossibilityId | null>(null);
  const narrow = size.width < 600;
  const layout = possibilities.map(p => ({ ...p, y: narrow ? (p.id === "consequences" ? 82 : 12) : p.y }));
  useEffect(() => {
    const element = map.current!;
    const core = element.querySelector<HTMLElement>(".spark-core")!;
    const observer = new ResizeObserver(() => {
      const bounds = element.getBoundingClientRect(), panel = core.getBoundingClientRect();
      const next = { width: bounds.width, height: bounds.height, coreWidth: panel.width, coreHeight: panel.height,
        coreRadius: parseFloat(getComputedStyle(core).borderTopLeftRadius) || 0 };
      setSize(previous => Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    });
    observer.observe(element); observer.observe(core); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const lines = [...map.current!.querySelectorAll<SVGPathElement>(".spark-ray")];
    const animations: Animation[] = [];
    if (!media.matches) lines.forEach((line, i) => {
      if (line.animate) animations.push(line.animate([{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1 }],
        { duration: 700, delay: i * 70, easing: "ease-out" }));
    });
    const stop = () => animations.forEach(a => a.cancel());
    media.addEventListener("change", stop);
    return () => { stop(); media.removeEventListener("change", stop); };
  }, [active, size.width, size.height]);
  return <div ref={map} className="spark-map" aria-label="Constelação de Possibilidades">
    <svg viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} aria-hidden="true">
      {layout.map(p => {
        const curve = orbitalLink({ x: size.width * .5, y: size.height * .48 }, { x: size.width * p.x / 100, y: size.height * p.y / 100 }, 33);
        if (!curve) return null;
        // Trim the quadratic at the actual rounded boundary, preserving its tangent.
        const center = { x: size.width * .5, y: size.height * .48 };
        const halfWidth = size.coreWidth / 2, halfHeight = size.coreHeight / 2;
        const radius = Math.min(size.coreRadius, halfWidth, halfHeight);
        const pointAt = (t: number) => ({ x: (1 - t) ** 2 * center.x + 2 * (1 - t) * t * curve.control.x + t * t * curve.end.x,
          y: (1 - t) ** 2 * center.y + 2 * (1 - t) * t * curve.control.y + t * t * curve.end.y });
        let inside = 0, outside = 1;
        for (let i = 0; i < 24; i++) {
          const t = (inside + outside) / 2, point = pointAt(t);
          const x = Math.abs(point.x - center.x) - halfWidth + radius, y = Math.abs(point.y - center.y) - halfHeight + radius;
          const distance = Math.hypot(Math.max(x, 0), Math.max(y, 0)) + Math.min(Math.max(x, y), 0) - radius;
          if (distance < 0) inside = t; else outside = t;
        }
        const start = pointAt(inside);
        const control = { x: (1 - inside) * curve.control.x + inside * curve.end.x, y: (1 - inside) * curve.control.y + inside * curve.end.y };
        return <path key={p.id} className="spark-ray" d={`M${start.x},${start.y} Q${control.x},${control.y} ${curve.end.x},${curve.end.y}`} pathLength={1} strokeDasharray="1 1" style={{ stroke: p.color }} />;
      })}
    </svg>
    <div className="spark-core" data-active={active}>
      {central.imageUrl && <div className="spark-core-reference"><SparkArtwork key={central.imageUrl} imageUrl={central.imageUrl} compact /></div>}
      <strong>{central.title}</strong><p tabIndex={0} aria-label="Texto da ideia central">{central.description}</p>
    </div>
    {layout.map(p => <button key={p.id} data-possibility={p.id}
      className="spark-path" style={{ left: `${p.x}%`, top: `${p.y}%`, "--category-color": p.color } as CSSProperties}
      onClick={() => choose(p.id)} onPointerEnter={() => setFocus(p.id)} onPointerLeave={() => setFocus(null)}
      onFocus={() => setFocus(p.id)} onBlur={() => setFocus(null)} aria-label={`${p.name} — ${p.hint}${paths[p.id].developed ? " · desenvolvida" : ""}`}>
      <span className="constellation-orb"><span aria-hidden="true">{p.symbol}</span><OrbitalParticles active={active && focus === p.id} /></span>
      <strong>{p.name}</strong><small>{p.hint}</small>{paths[p.id].developed && <span className="spark-developed">Desenvolvida</span>}
    </button>)}
  </div>;
}
