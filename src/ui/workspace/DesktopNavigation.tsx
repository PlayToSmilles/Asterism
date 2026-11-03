// SPDX-License-Identifier: MPL-2.0
export type DesktopArea = "explore" | "canvas" | "documents" | "references";
export function DesktopNavigation({ area, navigate, disabled }: {
  area: DesktopArea; navigate: (area: DesktopArea) => void; disabled: boolean;
}) {
  const items: { id: DesktopArea; label: string; path: string }[] = [
    { id: "explore", label: "Explorar", path: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM6 6c-2 3-3 8-1 11s6 4 9 3M18 18c2-3 3-8 1-11s-6-4-9-3M5 4h2v2H5zM17 18h2v2h-2z" },
    { id: "canvas", label: "Canvas", path: "M12 5v5M6 17l4-6M18 17l-4-6M10 3h4v3h-4zM4 17h4v3H4zM16 17h4v3h-4zM10 10h4v3h-4z" },
    { id: "documents", label: "Escrita", path: "M12 6c-2-2-5-2-8-2v14c3 0 6 0 8 2m0-14c2-2 5-2 8-2v14c-3 0-6 0-8 2m0-14v14" },
    { id: "references", label: "Referências", path: "M7 8h11v12H7zM4 16H3V5h11v1M10 3h10v12h-1" },
  ];
  return <nav className="studio-sidebar" aria-label="Áreas do workspace">
    {items.map(item => <button key={item.id} onClick={() => navigate(item.id)} disabled={disabled} aria-current={area === item.id ? "page" : undefined}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={item.path} /></svg><span>{item.label}</span>
    </button>)}
  </nav>;
}
