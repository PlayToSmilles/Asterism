// SPDX-License-Identifier: MPL-2.0
import { useEffect, useRef, type CSSProperties } from "react";
import type { Category } from "../../domain/model";
import { categoryPresentation } from "../categoryPresentation";

interface Props {
  source: Category;
  target: Category;
  origin: Category | null;
  path: string;
  width: number;
  count: number;
  badge?: { x: number; y: number };
  reducedMotion: boolean;
}

export function ConstellationConnection({ source, target, origin, path, width, count, badge, reducedMotion }: Props) {
  const root = useRef<SVGGElement>(null);
  const bank = useRef(0);
  const color = categoryPresentation[origin ?? source].color;
  const destination = origin === target ? source : target;
  useEffect(() => {
    const group = root.current;
    if (!group) return;
    const layers = [...group.querySelectorAll<SVGGElement>(".connection-trail")];
    const indicator = group.querySelector<SVGGElement>(".orbital-count-content");
    const animations = new Set<Animation>();
    let cancelled = false;
    const visible = !!group.ownerSVGElement?.getBoundingClientRect().width;
    const staticMode = reducedMotion || !visible || typeof group.animate !== "function";
    function run(element: SVGElement | HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions, settle: () => void) {
      const animation = element.animate(frames, { ...options, fill: "forwards" });
      animations.add(animation);
      void animation.finished.then(() => {
        if (!cancelled) settle();
        animations.delete(animation);
        animation.cancel();
      }, () => { animations.delete(animation); });
    }
    function fade(element: SVGElement, opacity: number, duration = 210) {
      const from = Number(getComputedStyle(element).opacity);
      if (staticMode || Math.abs(from - opacity) < .001) { element.style.opacity = String(opacity); return; }
      run(element, [{ opacity: from }, { opacity }], { duration, easing: "ease-out" }, () => { element.style.opacity = String(opacity); });
    }
    function arrive() {
      const ring = group!.closest(".constellation-map")?.querySelector<HTMLElement>(
        `.constellation-hub[data-category="${destination}"] .constellation-arrival`,
      );
      if (!ring || cancelled) return;
      run(ring, [
        { opacity: 0, transform: "scale(.98)" },
        { opacity: .55, transform: "scale(1.02)", offset: .24 },
        { opacity: 0, transform: "scale(1.12)" },
      ], { duration: 440, easing: "ease-out" }, () => {});
    }
    if (origin) {
      bank.current = 1 - bank.current;
      const current = layers[bank.current];
      layers.forEach(layer => { if (layer !== current) fade(layer, 0); });
      current.style.color = color;
      current.style.opacity = "0";
      const paths = [...current.querySelectorAll<SVGPathElement>("path")];
      const start = origin === target ? -1 : 1;
      const duration = Math.min(1000, Math.max(480, paths[0].getTotalLength() * .7));
      paths.forEach((line, index) => {
        line.style.strokeDashoffset = String(staticMode ? 0 : start);
        if (!staticMode) run(line, [{ strokeDashoffset: start }, { strokeDashoffset: 0 }],
          { duration, easing: "cubic-bezier(.25,.45,.35,1)" }, () => {
            line.style.strokeDashoffset = "0";
            if (index === paths.length - 1) arrive();
          });
      });
      fade(current, 1, 160);
      if (indicator) {
        indicator.style.color = color;
        if (staticMode) { indicator.style.opacity = "1"; indicator.style.transform = "none"; }
        else {
          const opacity = Number(getComputedStyle(indicator).opacity);
          const transform = opacity > .01 ? getComputedStyle(indicator).transform : "scale(.86)";
          indicator.style.transform = transform;
          run(indicator, [{ opacity, transform }, { opacity: 1, transform: "scale(1)" }],
          { duration: 240, delay: opacity > .01 ? 0 : duration * .38, easing: "ease-out" }, () => {
            indicator.style.opacity = "1"; indicator.style.transform = "none";
          });
        }
      }
      group.dataset.traceOrigin = origin;
    } else {
      layers.forEach(layer => fade(layer, 0));
      if (indicator) fade(indicator, 0);
      delete group.dataset.traceOrigin;
    }
    return () => {
      cancelled = true;
      // Freeze current paint before cancelling so interrupted fades do not jump.
      layers.forEach(layer => {
        layer.style.opacity = getComputedStyle(layer).opacity;
        layer.querySelectorAll<SVGPathElement>("path").forEach(line => {
          line.style.strokeDashoffset = getComputedStyle(line).strokeDashoffset;
        });
      });
      if (indicator) {
        indicator.style.opacity = getComputedStyle(indicator).opacity;
        indicator.style.transform = getComputedStyle(indicator).transform;
      }
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
  }, [origin, path, target, destination, color, reducedMotion]);
  const badgeWidth = Math.max(32, String(count).length * 7 + 16);
  return <g ref={root} className={`aggregate-link${origin ? " aggregate-active" : ""}`}
    data-source={source} data-target={target}
    style={{ "--link-color": categoryPresentation[source].color } as CSSProperties}>
    <path className="aggregate-base" d={path} strokeWidth={width} />
    {[0, 1].map(index => <g className="connection-trail" key={index}>
      <path className="connection-aura" d={path} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} strokeWidth={width + 4} />
      <path className="connection-light" d={path} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} strokeWidth={width + .65} />
    </g>)}
    {badge && <g className="orbital-count" transform={`translate(${badge.x},${badge.y})`}>
      <g className="orbital-count-content">
        <rect x={-badgeWidth / 2} y="-11" width={badgeWidth} height="22" rx="11" />
        <text textAnchor="middle" dominantBaseline="central">{count}</text>
      </g>
    </g>}
  </g>;
}
