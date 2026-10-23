// SPDX-License-Identifier: MPL-2.0
import { useSelectionIndicator } from "../motion/useSelectionIndicator";

export function DesktopNavigation({
  area,
  canvas,
  documents,
  references,
}: {
  area: "canvas" | "documents" | "references";
  canvas: () => void;
  documents: () => void;
  references: () => void;
}) {
  const navigation = useSelectionIndicator<HTMLElement>(area);
  return (
    <nav ref={navigation} className="workspace-navigation sliding-selection" aria-label="Áreas do workspace">
      <span className="selection-indicator" aria-hidden="true" />
      <button
        aria-current={area === "canvas" ? "page" : undefined}
        onClick={canvas}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 6h8M6 8v8M18 8v8M8 18h8M3 3h5v5H3zM16 3h5v5h-5zM3 16h5v5H3zM16 16h5v5h-5z" />
        </svg>
        <span>Canvas</span>
      </button>
      <button
        aria-current={area === "documents" ? "page" : undefined}
        onClick={documents}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 3h10l4 4v14H5V3Zm9 0v5h5M8 12h8M8 16h6" />
        </svg>
        <span>Escrita</span>
      </button>
      <button
        aria-current={area === "references" ? "page" : undefined}
        onClick={references}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h12v16H4zM8 8h4M8 12h4M19 7h2v16H8" />
        </svg>
        <span>PDFs</span>
      </button>
    </nav>
  );
}
