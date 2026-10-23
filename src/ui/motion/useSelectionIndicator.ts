import { useLayoutEffect, useRef } from "react";

export function useSelectionIndicator<T extends HTMLElement>(active: string) {
  const root = useRef<T>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      const button = element.querySelector<HTMLElement>('[aria-current="page"], [aria-pressed="true"]');
      if (!button) return;
      const parent = element.getBoundingClientRect(), selected = button.getBoundingClientRect();
      element.style.setProperty("--selection-x", `${selected.left - parent.left}px`);
      element.style.setProperty("--selection-y", `${selected.top - parent.top}px`);
      element.style.setProperty("--selection-width", `${selected.width}px`);
      element.style.setProperty("--selection-height", `${selected.height}px`);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { element.dataset.selectionReady = "true"; });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [active]);
  return root;
}
