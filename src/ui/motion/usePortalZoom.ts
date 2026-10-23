import { useEffect, useMemo, type RefObject } from "react";
import { flushSync } from "react-dom";

type Direction = "enter" | "leave";

// The library stays alive; only its decorative cover is copied. The workspace
// is revealed in its real, unscaled layout, just like the constellation portal.
export function createProjectTransition(getRoot: () => HTMLElement | null) {
  let current: { id: string; prepared: () => void; dispose: () => void } | null = null;
  return {
    get pending() { return current !== null; },
    ready(id: string) { if (current?.id === id) current.prepared(); },
    dispose() { current?.dispose(); },
    async start(id: string, direction: Direction, navigate: () => void) {
      if (current) return;
      const root = getRoot();
      if (!root) { navigate(); return; }
      const home = root.querySelector<HTMLElement>(".project-home-layer");
      const animations = new Set<Animation>();
      const media = matchMedia("(prefers-reduced-motion: reduce)");
      let instant = media.matches || !root.animate || !CSS.supports("clip-path", "inset(0px round 1px)");
      let disposed = false, committed = false;
      let prepare!: () => void;
      const prepared = new Promise<void>(resolve => { prepare = resolve; });
      const commit = () => {
        if (!committed && !disposed) { committed = true; flushSync(navigate); }
      };
      const inert = root.inert;
      const ghost = document.createElement("div");
      ghost.className = "project-cover-portal";
      ghost.setAttribute("aria-hidden", "true");
      ghost.inert = true;
      const finish = () => { instant = true; animations.forEach(animation => animation.cancel()); };
      const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); finish(); } };
      const preference = () => { if (media.matches) finish(); };
      // Safety release only: normal progression is gated by actual readiness.
      const watchdog = window.setTimeout(() => { finish(); prepare(); }, 3000);
      const cleanup = () => {
        animations.forEach(animation => animation.cancel()); animations.clear();
        ghost.remove();
        window.clearTimeout(watchdog);
        window.removeEventListener("resize", finish);
        document.removeEventListener("keydown", escape, true);
        media.removeEventListener("change", preference);
        if (current === job) {
          delete root.dataset.projectTransition;
          root.inert = inert;
          current = null;
        }
      };
      const job = { id, prepared: prepare, dispose: () => { disposed = true; prepare(); cleanup(); } };
      current = job;
      root.dataset.projectTransition = direction;
      root.inert = true;
      window.addEventListener("resize", finish);
      document.addEventListener("keydown", escape, true);
      media.addEventListener("change", preference);
      const animate = async (element: Element | null, frames: Keyframe[], duration: number) => {
        if (!element || instant || disposed) return;
        const animation = element.animate(frames, { duration, easing: "cubic-bezier(.32,0,.16,1)", fill: "both" });
        animations.add(animation);
        try { await animation.finished; } catch { /* Interruption finishes safely. */ }
      };
      try {
        const article = [...(home?.querySelectorAll<HTMLElement>("[data-project-id]") ?? [])].find(tile => tile.dataset.projectId === id);
        const cover = article?.querySelector<HTMLElement>(".asterism-project-cover");
        const box = root.getBoundingClientRect();
        const tile = cover?.getBoundingClientRect();
        const visible = tile && tile.width > 0 && tile.height > 0 && tile.bottom > box.top && tile.top < box.bottom && tile.right > box.left && tile.left < box.right;
        if (!visible || !cover) instant = true;
        if (!instant && cover) {
          // Copy only the aria-hidden artwork, never titles, buttons or dialogs.
          const copy = cover.cloneNode(true) as HTMLElement;
          copy.removeAttribute("id");
          copy.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
          const styles = getComputedStyle(cover);
          for (const property of ["--cover-color", "--cover-bg", "--cover-glow"]) ghost.style.setProperty(property, styles.getPropertyValue(property));
          ghost.append(copy);
          root.append(ghost);
          Object.assign(ghost.style, { left: `${tile!.left}px`, top: `${tile!.top}px`, width: `${tile!.width}px`, height: `${tile!.height}px` });
        }
        if (direction === "enter") { commit(); await prepared; }
        if (disposed) return;
        window.clearTimeout(watchdog);
        const workspace = root.querySelector<HTMLElement>(".project-workspace-layer");
        if (!instant && tile && workspace) {
          const small = { left: `${tile.left}px`, top: `${tile.top}px`, width: `${tile.width}px`, height: `${tile.height}px`, borderRadius: "17px" };
          const large = { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px`, borderRadius: "0px" };
          const aperture = `inset(${Math.max(0, tile.top - box.top)}px ${Math.max(0, box.right - tile.right)}px ${Math.max(0, box.bottom - tile.bottom)}px ${Math.max(0, tile.left - box.left)}px round 17px)`;
          const full = "inset(0px 0px 0px 0px round 0px)";
          const duration = box.width < 701 ? 430 : 620;
          if (direction === "enter") {
            void animate(home, [{ opacity: 1 }, { opacity: .3, offset: .5 }, { opacity: 0 }], duration);
            void animate(ghost, [{ ...small, opacity: 1 }, { ...large, opacity: .4, offset: .65 }, { ...large, opacity: 0 }], duration);
            void animate(ghost.querySelector(".asterism-mark"), [{ transform: "scale(1)" }, { transform: "scale(3)", opacity: 0 }], duration);
            await animate(workspace, [{ clipPath: aperture, opacity: 0 }, { opacity: .85, offset: .4 }, { clipPath: full, opacity: 1 }], duration);
          } else {
            void animate(home, [{ opacity: 0 }, { opacity: 1, offset: .65 }, { opacity: 1 }], duration);
            void animate(ghost, [{ ...large, opacity: 0 }, { opacity: .95, offset: .5 }, { ...small, opacity: 1 }], duration);
            void animate(ghost.querySelector(".asterism-mark"), [{ transform: "scale(3)", opacity: 0 }, { transform: "scale(1)", opacity: .8 }], duration);
            await animate(workspace, [{ clipPath: full, opacity: 1 }, { opacity: .5, offset: .6 }, { clipPath: aperture, opacity: 0 }], duration);
          }
        }
        if (!disposed) commit();
      } finally {
        cleanup();
        if (!disposed) {
          const destination = direction === "enter" ? root.querySelector<HTMLElement>(".back-button")
            : [...(home?.querySelectorAll<HTMLElement>("[data-project-id]") ?? [])].find(tile => tile.dataset.projectId === id)?.querySelector<HTMLElement>(".asterism-open")
              ?? home?.querySelector<HTMLElement>("h1");
          destination?.focus({ preventScroll: true });
        }
      }
    },
  };
}

export function useProjectTransition(root: RefObject<HTMLElement | null>) {
  const transition = useMemo(() => createProjectTransition(() => root.current), [root]);
  useEffect(() => () => transition.dispose(), [transition]);
  return transition;
}
