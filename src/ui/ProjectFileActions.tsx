import { useRef } from "react";
export function ProjectFileActions({
  importFile,
  exportFile,
  shareFile,
}: {
  importFile: () => void;
  exportFile: () => void;
  shareFile?: () => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  const actions = (
    <>
      <button onClick={importFile} title="Importar como outro projeto">
        Importar
      </button>
      <button onClick={exportFile}>Exportar JSON</button>
      {shareFile && (
        <button className="share-file" onClick={shareFile}>
          Compartilhar JSON
        </button>
      )}
    </>
  );
  return (
    <>
      <div className="desktop-file-actions">{actions}</div>
      <details className="mobile-file-actions" ref={menu}>
        <summary>Arquivos ⌄</summary>
        <div
          className="file-menu"
          onClick={() => menu.current?.removeAttribute("open")}
        >
          {actions}
        </div>
      </details>
    </>
  );
}
