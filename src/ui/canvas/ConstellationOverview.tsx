import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Category, Project } from "../../domain/model";
import { categoryGroups } from "./exploration";
import { categoryPresentation } from "../categoryPresentation";
import { orbitalLink } from "./constellationGeometry";
import { OrbitalParticles } from "./OrbitalParticles";
import { ConstellationConnection } from "./ConstellationConnection";

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
  const points = new Map(groups.map((g, i) => {
    const angle = i / groups.length * Math.PI * 2 - Math.PI / 2;
    return [g.category, { x: 50 + Math.cos(angle) * 35, y: 44 + Math.sin(angle) * 30 }];
  }));
  return <section className="constellation-overview" aria-label="Constelações por categoria"
    onPointerDownCapture={event => {
      if (event.target instanceof Element && !event.target.closest(".constellation-hub")) setTouchDetails(null);
    }}>
    <header><h2 className="constellation-label">CONSTELAÇÕES DE CONHECIMENTO</h2></header>
    {groups.length === 0 ? <p className="muted">Adicione elementos no Canvas livre para começar.</p> : <div ref={map} className={`constellation-map${lineFocus ? " has-highlight" : ""}`}>
      {size && <svg viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true">
        {links.map((link, i) => {
          const a = points.get(link.source)!, b = points.get(link.target)!;
          const active = lineFocus === link.source || lineFocus === link.target;
          const curve = orbitalLink({ x: a.x * size.width / 100, y: a.y * size.height / 100 },
            { x: b.x * size.width / 100, y: b.y * size.height / 100 }, 33, i % 2 ? 1 : -1);
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
