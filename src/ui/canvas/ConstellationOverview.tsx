// SPDX-License-Identifier: MPL-2.0
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Category, Project } from "../../domain/model";
import { categoryGroups } from "./exploration";
import { categoryPresentation } from "../categoryPresentation";
import { orbitalLink } from "./constellationGeometry";
import { OrbitalParticles } from "./OrbitalParticles";
import { ConstellationConnection } from "./ConstellationConnection";

// Presentation anchors only: never written to the universe or React Flow nodes.
const categoryAnchors: Record<Category, { x: number; y: number }> = {
  Personagem: { x: 38, y: 40 },
  Local: { x: 67, y: 22 },
  Facção: { x: 85, y: 43 },
  Magia: { x: 76, y: 73 },
  Evento: { x: 47, y: 77 },
  Ideia: { x: 17, y: 66 },
  Artefato: { x: 52, y: 12 },
  Documento: { x: 16, y: 27 },
};
const smallCompositions = [
  [],
  [{ x: 50, y: 42 }],
  [{ x: 36, y: 34 }, { x: 66, y: 57 }],
  [{ x: 30, y: 35 }, { x: 67, y: 28 }, { x: 55, y: 70 }],
];
// Deterministic decoration: no animation loop or random changes on hover.
const stars = Array.from({ length: 94 }, (_, i) => ({
  x: (i * 317 + 83) % 1600,
  y: (i * 193 + i * i * 17 + 71) % 1000,
  radius: i % 13 === 0 ? 2 : i % 4 === 0 ? 1.2 : .65,
  opacity: .12 + (i % 5) * .08,
}));

export function ConstellationOverview({ project, enter, prepared }: { project: Project; enter: (category: Category) => void; prepared?: () => void }) {
  const { groups, links } = useMemo(() => categoryGroups(project), [project]);
  const [hovered, setHovered] = useState<Category | null>(null);
  const [focused, setFocused] = useState<Category | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [touchDetails, setTouchDetails] = useState<Category | null>(null);
  const pointer = useRef("");
  const highlight = touchDetails ?? hovered ?? focused;
  const lineFocus = highlight ?? selected;
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const map = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    if (size && size.width > 0 && size.height > 0) prepared?.();
  }, [size, prepared]);
  useLayoutEffect(() => {
    if (!map.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(current => current?.width === width && current.height === height ? current : { width, height });
    });
    observer.observe(map.current);
    return () => observer.disconnect();
  }, [groups.length]);
  const points = useMemo(() => new Map(groups.map((g, i) => {
    return [g.category, smallCompositions[groups.length]?.[i] ?? categoryAnchors[g.category]];
  })), [groups]);
  const routes = useMemo(() => {
    if (!size) return [];
    const centers = new Map([...points].map(([category, point]) => [category,
      { x: point.x * size.width / 100, y: point.y * size.height / 100 }]));
    return links.map((link, i) => ({ link, curve: orbitalLink(centers.get(link.source)!, centers.get(link.target)!,
      33, i % 2 ? 1 : -1, [...centers.values()]) }));
  }, [links, points, size]);
  return <section className="constellation-overview" aria-label="Constelações por categoria"
    onPointerDownCapture={event => {
      if (event.target instanceof Element && !event.target.closest(".constellation-hub")) setTouchDetails(null);
    }}>
    <svg className="constellation-sky" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {stars.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.radius}
        fill={i % 7 === 0 ? "#baa4e9" : "#c5d5ee"} opacity={star.opacity} />)}
      <g className="constellation-sky-orbits" fill="none" stroke="#aaa0d1">
        <ellipse cx="780" cy="580" rx="440" ry="155" transform="rotate(-23 780 580)" />
        <ellipse cx="780" cy="580" rx="448" ry="162" transform="rotate(-23 780 580)" />
        <path d="M180 760 Q650 180 1480 380" />
      </g>
    </svg>
    <header><h2 className="constellation-label">CONSTELAÇÕES DE CONHECIMENTO</h2></header>
    {groups.length === 0 ? <p className="muted">Adicione elementos no Canvas livre para começar.</p> : <div ref={map} className={`constellation-map${lineFocus ? " has-highlight" : ""}`}>
      {size && <svg viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true">
        {routes.map(({ link, curve }) => {
          const active = lineFocus === link.source || lineFocus === link.target;
          if (!curve) return null;
          // Keep line counts out of the category icons and captions. If the
          // layout is too dense, the full counts remain in the details below.
          const badge = [.5, .38, .62, .26, .74].map(t => ({
            x: (1 - t) ** 2 * curve.start.x + 2 * (1 - t) * t * curve.control.x + t ** 2 * curve.end.x,
            y: (1 - t) ** 2 * curve.start.y + 2 * (1 - t) * t * curve.control.y + t ** 2 * curve.end.y,
          })).find(p => [...points.values()].every(point => {
            const x = point.x * size.width / 100, y = point.y * size.height / 100;
            return Math.abs(p.x - x) > 104 || p.y < y - 52 || p.y > y + 124;
          }));
          return <ConstellationConnection key={JSON.stringify([link.source, link.target])}
            source={link.source} target={link.target} origin={active ? lineFocus : null}
            path={curve.path} width={Math.min(2.4, .8 + Math.sqrt(link.count) * .2)}
            count={link.count} badge={badge} reducedMotion={reducedMotion} />;
        })}
      </svg>}
      {groups.map(group => {
        const point = points.get(group.category)!;
        const appearance = categoryPresentation[group.category];
        return <button key={group.category} className="constellation-hub"
          data-category={group.category}
          data-active={highlight === group.category}
          data-selected={selected === group.category}
          aria-pressed={selected === group.category}
          aria-label={`${group.category}: ${group.count} ${group.count === 1 ? "elemento" : "elementos"}, ${group.internal} relações internas e ${group.external} externas. Enter para explorar; Espaço para marcar. No toque, toque novamente para explorar.`}
          style={{ left: `${point.x}%`, top: `${point.y}%`, "--category-color": appearance.color } as CSSProperties}
          onMouseLeave={() => setHovered(null)}
          onPointerDown={event => {
            pointer.current = event.pointerType;
            if (event.pointerType === "touch") { setHovered(null); setFocused(null); }
          }}
          onFocus={event => {
            if (event.currentTarget.matches(":focus-visible")) { setFocused(group.category); setHovered(null); setTouchDetails(null); }
          }}
          onBlur={() => { setFocused(null); setTouchDetails(null); }}
          onKeyDown={event => {
            if (event.key !== " ") return;
            event.preventDefault();
            if (!event.repeat) setSelected(current => current === group.category ? null : group.category);
          }}
          onClick={event => {
            setSelected(group.category);
            if (event.detail > 0 && pointer.current === "touch" && touchDetails !== group.category) {
              setTouchDetails(group.category);
              return;
            }
            enter(group.category);
          }}>
          <span className="constellation-orb" aria-hidden="true"
            onPointerEnter={event => { pointer.current = event.pointerType; }}
            onMouseEnter={() => {
              if (pointer.current !== "touch") { setHovered(group.category); setTouchDetails(null); }
            }}>
            {appearance.symbol}<span className="constellation-arrival" /><OrbitalParticles active={hovered === group.category || focused === group.category || touchDetails === group.category || selected === group.category} />
          </span>
          <strong>{group.category}</strong>
          <span className="constellation-reveal" aria-hidden={highlight !== group.category}>
            <span className="constellation-total"><b>{group.count}</b> {group.count === 1 ? "elemento" : "elementos"}</span>
            <small className="constellation-stats"><span><b>{group.internal}</b> internas</span><span><b>{group.external}</b> externas</span></small>
          </span>
        </button>;
      })}
    </div>}
    <p className="constellation-touch-hint">Toque numa categoria para ver os detalhes; toque novamente para explorar.</p>
    <details className="aggregate-counts"><summary>Consultar relações entre categorias · {links.length} ligações agregadas</summary>
      <p>Contagens de relações existentes, sem direção agregada. Explore uma categoria ou o Inspector para consultar cada relação.</p>
      <div>{links.map(link => <button key={JSON.stringify([link.source, link.target])} onClick={() => enter(link.source)}>
        <span>{link.source} · {link.target}</span><strong>{link.count}</strong>
        <small>{link.kinds.directional} direcionais · {link.kinds.reciprocal} recíprocas · {link.kinds.associative} associativas</small>
      </button>)}</div>
    </details>
  </section>;
}
