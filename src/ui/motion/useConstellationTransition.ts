import { useEffect, useMemo, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import type { Category } from "../../domain/model";
import { categoryPresentation } from "../categoryPresentation";

type Direction = "enter" | "leave";

// Keep the live overview while the existing Flow instance prepares behind it.
export function createConstellationTransition(getHost: () => HTMLElement | null, retain: (value: boolean) => void = () => {}) {
  let overviewScroll = 0;
  let current: { direction: Direction; prepared: () => void; dispose: () => void } | null = null;
  return {
    get pending() { return current !== null; },
    get direction() { return current?.direction; },
    ready() { current?.prepared(); },
    dispose() { current?.dispose(); },
    async start(category: Category, direction: Direction, navigate: () => void) {
      if (current) return;
      const host = getHost();
      if (!host) { navigate(); return; }
      const flow = host.querySelector<HTMLElement>(".flow-layer");
      const chrome = host.querySelector<HTMLElement>(".exploration-chrome");
      const sourceBox = host.getBoundingClientRect();
      const sourceTile = host.querySelector<HTMLElement>(`.constellation-hub[data-category="${category}"] .constellation-orb`)?.getBoundingClientRect();
      if (direction === "enter") overviewScroll = host.querySelector(".constellation-overview")?.scrollTop ?? 0;
      const animations = new Set<Animation>();
      const restored: (() => void)[] = [];
      function style(element: HTMLElement | null, property: string, value: string) {
        if (!element) return;
        const before = element.style.getPropertyValue(property);
        restored.push(() => { if (before) element.style.setProperty(property, before); else element.style.removeProperty(property); });
        element.style.setProperty(property, value);
      }
      const media = matchMedia("(prefers-reduced-motion: reduce)");
      let instant = media.matches || !flow?.animate || !CSS.supports("clip-path", "circle(1px at 0px 0px)");
      let committed = false, disposed = false;
      let prepare!: () => void;
      const prepared = new Promise<void>(resolve => { prepare = resolve; });
      const commit = () => { if (!committed && !disposed) { committed = true; navigate(); } };
      const overlay = document.createElement("div");
      overlay.className = "constellation-portal";
      overlay.setAttribute("aria-hidden", "true");
      const inert = host.inert;
      const finish = () => {
        instant = true;
        animations.forEach(animation => animation.cancel());
        // Keep the source painted until preparation has actually finished.
        commit();
      };
      const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); finish(); } };
      const preference = () => { if (media.matches) finish(); };
      const cleanup = () => {
        // Remove the outgoing overview while its final opacity and the Flow's
        // foreground layer still hold. Cancelling first exposes the map for a frame.
        if (current === job && !disposed) flushSync(() => retain(false));
        animations.forEach(animation => animation.cancel());
        animations.clear();
        overlay.remove();
        if (current === job) {
          restored.reverse().forEach(restore => restore());
          host.inert = inert;
          delete host.dataset.portalTransition;
          current = null;
          if (disposed) retain(false);
        }
        window.removeEventListener("resize", finish);
        document.removeEventListener("keydown", escape, true);
        media.removeEventListener("change", preference);
      };
      const job = { direction, prepared: prepare, dispose: () => { disposed = true; prepare(); cleanup(); } };
      current = job;
      host.inert = true;
      host.dataset.portalTransition = direction;
      window.addEventListener("resize", finish);
      document.addEventListener("keydown", escape, true);
      media.addEventListener("change", preference);
      const animate = async (element: Element | null, frames: Keyframe[], duration: number, delay = 0) => {
        if (!element || instant || disposed) return;
        const animation = element.animate(frames, { duration, delay, easing: "cubic-bezier(.42,0,.2,1)", fill: "both" });
        animations.add(animation);
        try { await animation.finished; } catch { /* Esc/resize/unmount intentionally cancel. */ }
      };
      try {
        style(flow, "position", "absolute"); style(flow, "inset", "0"); style(flow, "z-index", "5");
        style(flow, "background", "#141620"); style(flow, "opacity", direction === "enter" ? "0" : "1");
        retain(true);
        if (direction === "enter" || instant) commit();
        // Entry: projected nodes + camera. Return: mounted live overview, while
        // the outgoing category and its positions remain unchanged.
        await prepared;
        if (disposed) return;
        if (instant) { commit(); return; }
        const scene = host.querySelector<HTMLElement>(".constellation-overview");
        if (scene) scene.scrollTop = overviewScroll;
        const circle = host.querySelector<HTMLElement>(`.constellation-hub[data-category="${category}"] .constellation-orb`);
        const box = direction === "enter" ? sourceBox : host.getBoundingClientRect();
        const tile = direction === "enter" ? sourceTile : circle?.getBoundingClientRect();
        const x = tile ? tile.left + tile.width / 2 - box.left : box.width / 2;
        const y = tile ? tile.top + tile.height / 2 - box.top : box.height / 2;
        const radius = tile?.width ? tile.width / 2 : 31;
        const full = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)) + 4;
        const small = `circle(${radius}px at ${x}px ${y}px)`, large = `circle(${full}px at ${x}px ${y}px)`;
        const duration = 760;
        style(flow, "clip-path", direction === "enter" ? small : large);
        // The source remains beneath the aperture; no opaque transition screen.
        style(flow, "opacity", "1");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
        const rim = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        Object.entries({ cx: String(x), cy: String(y), r: String(radius), fill: "none", stroke: categoryPresentation[category].color,
          "stroke-width": "1.6", "vector-effect": "non-scaling-stroke" }).forEach(([key, value]) => rim.setAttribute(key, value));
        rim.style.transformOrigin = `${x}px ${y}px`;
        svg.append(rim); overlay.append(svg); host.append(overlay);
        void animate(chrome, [{ opacity: 1 }, { opacity: 0, offset: .15 }, { opacity: 0 }], duration);
        if (direction === "enter") {
          void animate(scene, [{ opacity: 1 }, { opacity: 1, offset: .25 }, { opacity: .7, offset: .65 }, { opacity: 0 }], duration);
          void animate(circle, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(3.8)", opacity: 1, offset: .3 },
            { transform: "scale(9)", opacity: 0, offset: .65 }, { transform: "scale(9)", opacity: 0 }], duration);
          void animate(rim, [{ transform: "scale(1)", opacity: .9 }, { transform: "scale(3.8)", opacity: .9, offset: .3 },
            { transform: `scale(${full / radius})`, opacity: 0 }], duration);
          const cards = [...host.querySelectorAll(".react-flow__node .universe-card")];
          cards.forEach((card, i) => { void animate(card, [{ opacity: 0 }, { opacity: 1 }], 300, Math.min(i, 6) * 18 + 120); });
          await animate(flow, [{ clipPath: small, opacity: 0 }, { clipPath: `circle(${radius * 3.8}px at ${x}px ${y}px)`, opacity: .85, offset: .3 },
            { clipPath: large, opacity: 1 }], duration);
        } else {
          void animate(scene, [{ opacity: 0 }, { opacity: 1, offset: .65 }, { opacity: 1 }], duration);
          void animate(circle, [{ transform: "scale(9)", opacity: 0 }, { transform: "scale(3.8)", opacity: .5, offset: .7 },
            { transform: "scale(1)", opacity: 1 }], duration);
          void animate(rim, [{ transform: `scale(${full / radius})`, opacity: 0 }, { transform: "scale(3.8)", opacity: .9, offset: .7 },
            { transform: "scale(1)", opacity: .9 }], duration);
          await animate(flow, [{ clipPath: large, opacity: 1 }, { clipPath: `circle(${radius * 3.8}px at ${x}px ${y}px)`, opacity: .85, offset: .7 },
            { clipPath: small, opacity: 0 }], duration);
          if (!disposed) flushSync(commit);
        }
        // Keep the completed scene/aperture painted during the controls' return.
        await animate(chrome, [{ opacity: 0 }, { opacity: 1 }], 100);
      } finally {
        cleanup();
        if (!disposed) {
          const focus = direction === "leave" ? host.querySelector<HTMLElement>(`.constellation-hub[data-category="${category}"]`)
            : host.querySelector<HTMLElement>(".flow-layer");
          focus?.focus({ preventScroll: true });
        }
      }
    },
  };
}

export function useConstellationTransition(host: RefObject<HTMLElement | null>) {
  const [retainOverview, setRetainOverview] = useState(false);
  const transition = useMemo(() => createConstellationTransition(() => host.current, setRetainOverview), [host]);
  useEffect(() => () => transition.dispose(), [transition]);
  return { transition, retainOverview };
}
