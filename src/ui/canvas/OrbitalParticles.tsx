// SPDX-License-Identifier: MPL-2.0
import { useEffect, useRef } from "react";
import { createOrbitalMotion } from "../motion/orbitalMotion";

export function OrbitalParticles({ active }: { active: boolean }) {
  const root = useRef<HTMLSpanElement>(null);
  const motion = useRef<ReturnType<typeof createOrbitalMotion> | null>(null);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    container.dataset.orbitState = "rest";
    const dots = [...container.querySelectorAll<HTMLElement>("i")];
    if (dots.some(dot => typeof dot.animate !== "function")) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controller = createOrbitalMotion(dots.map(element => ({ element, home: {
      x: element.offsetLeft + element.offsetWidth / 2 - container.clientWidth / 2,
      y: element.offsetTop + element.offsetHeight / 2 - container.clientHeight / 2,
    } })), stage => { container.dataset.orbitState = stage; });
    motion.current = controller;
    const preference = () => controller.setReducedMotion(media.matches);
    preference();
    media.addEventListener("change", preference);
    return () => {
      media.removeEventListener("change", preference);
      controller.dispose();
      motion.current = null;
    };
  }, []);
  useEffect(() => { motion.current?.setActive(active); }, [active]);
  return <span ref={root} className="constellation-particles" aria-hidden="true"><i /><i /><i /></span>;
}
