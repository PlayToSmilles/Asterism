// SPDX-License-Identifier: MPL-2.0
import { useEffect, useMemo, type RefObject } from "react";
import { flushSync } from "react-dom";
import type { PossibilityId } from "./possibilities";

// Same two-live-layers/aperture technique as the category transition, without
// its category model, React Flow camera, preparation wait or navigation system.
export function createPossibilityTransition(getHost: () => HTMLElement | null) {
  let current: { finish: () => void; dispose: () => void } | null = null;
  return {
    get pending() { return !!current; },
    dispose() { current?.dispose(); },
    async start(id: PossibilityId, direction: "enter" | "leave", navigate: () => void) {
      if (current) return;
      const host = getHost();
      if (!host) { navigate(); return; }
      const map = host.querySelector<HTMLElement>(".spark-map-layer");
      const orb = host.querySelector<HTMLElement>(`[data-possibility="${id}"] .constellation-orb`);
      const circle = orb?.getBoundingClientRect();
      const media = matchMedia("(prefers-reduced-motion: reduce)");
      if (!map || !circle || media.matches || !host.animate || !CSS.supports("clip-path", "circle(1px at 0px 0px)")) {
        flushSync(navigate);
        host.querySelector<HTMLElement>(direction === "enter" ? "[data-writing-heading]" : `[data-possibility="${id}"]`)?.focus({ preventScroll: true });
        return;
      }
      let committed = false, disposed = false;
      const animations = new Set<Animation>(), restores: (() => void)[] = [];
      const inert = host.inert;
      const commit = () => { if (!disposed && !committed) { committed = true; flushSync(navigate); } };
      const finish = () => { commit(); animations.forEach(a => a.cancel()); };
      const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); finish(); } };
      const preference = () => { if (media.matches) finish(); };
      const style = (element: HTMLElement, property: string, value: string) => {
        const before = element.style.getPropertyValue(property);
        restores.push(() => { if (before) element.style.setProperty(property, before); else element.style.removeProperty(property); });
        element.style.setProperty(property, value);
      };
      const job = { finish, dispose: () => { disposed = true; animations.forEach(a => a.cancel()); } };
      current = job;
      host.inert = true;
      host.dataset.traversing = direction;
      window.addEventListener("resize", finish);
      document.addEventListener("keydown", escape, true);
      media.addEventListener("change", preference);
      const animate = async (element: Element, frames: Keyframe[]) => {
        const animation = element.animate(frames, { duration: 680, easing: "cubic-bezier(.42,0,.2,1)", fill: "both" });
        animations.add(animation);
        try { await animation.finished; } catch { /* Interruption completes safely. */ }
      };
      try {
        style(map, "visibility", "visible");
        if (direction === "enter") commit();
        const writer = host.querySelector<HTMLElement>(".spark-writing-layer");
        if (!writer) { commit(); return; }
        style(writer, "visibility", "visible");
        const box = writer.getBoundingClientRect();
        const x = circle.left + circle.width / 2 - box.left, y = circle.top + circle.height / 2 - box.top;
        const radius = circle.width / 2;
        const small = `circle(${radius}px at ${x}px ${y}px)`;
        const large = `circle(${Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)) + 2}px at ${x}px ${y}px)`;
        if (direction === "enter") {
          void animate(map, [{ opacity: 1 }, { opacity: .7, offset: .55 }, { opacity: 0 }]);
          if (orb) void animate(orb, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(4)", opacity: 1, offset: .4 }, { transform: "scale(10)", opacity: 0 }]);
          await animate(writer, [{ clipPath: small, opacity: 0 }, { clipPath: `circle(${radius * 4}px at ${x}px ${y}px)`, opacity: .9, offset: .4 }, { clipPath: large, opacity: 1 }]);
        } else {
          void animate(map, [{ opacity: 0 }, { opacity: 1, offset: .6 }, { opacity: 1 }]);
          if (orb) void animate(orb, [{ transform: "scale(8)", opacity: 0 }, { transform: "scale(3)", opacity: .7, offset: .65 }, { transform: "scale(1)", opacity: 1 }]);
          await animate(writer, [{ clipPath: large, opacity: 1 }, { clipPath: small, opacity: 0 }]);
          commit();
        }
      } finally {
        animations.forEach(a => a.cancel());
        restores.reverse().forEach(restore => restore());
        host.inert = inert;
        delete host.dataset.traversing;
        window.removeEventListener("resize", finish);
        document.removeEventListener("keydown", escape, true);
        media.removeEventListener("change", preference);
        if (current === job) current = null;
        if (!disposed) host.querySelector<HTMLElement>(direction === "enter" ? "[data-writing-heading]" : `[data-possibility="${id}"]`)?.focus({ preventScroll: true });
      }
    },
  };
}
export function usePossibilityTransition(host: RefObject<HTMLElement | null>, visible: boolean) {
  const transition = useMemo(() => createPossibilityTransition(() => host.current), [host]);
  useEffect(() => () => transition.dispose(), [transition]);
  useEffect(() => { if (!visible) transition.dispose(); }, [visible, transition]);
  return transition;
}
