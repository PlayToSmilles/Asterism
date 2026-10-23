// SPDX-License-Identifier: MPL-2.0
import { useEffect } from "react";
export function useVisualViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      // Respect native page pinch zoom; only resize the workspace for keyboard /
      // browser chrome changes at the normal page scale.
      if (Math.abs(viewport.scale - 1) > 0.01) return;
      document.documentElement.style.setProperty(
        "--visible-height",
        `${viewport.height}px`,
      );
      document.documentElement.style.setProperty(
        "--visible-top",
        `${viewport.offsetTop}px`,
      );
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--visible-height");
      document.documentElement.style.removeProperty("--visible-top");
    };
  }, []);
}
