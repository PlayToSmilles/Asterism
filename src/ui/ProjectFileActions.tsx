// SPDX-License-Identifier: MPL-2.0
import { useRef } from "react";
export function ProjectFileActions({
  importFile,
  exportFile,
  backupFile,
  shareFile,
}: {
  importFile: () => void;
  exportFile: () => void;
  backupFile: () => void;
  shareFile?: () => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  const actions = (
    <>
      <button onClick={importFile} title="Importar como outro projeto">
        Importar
      </button>
      <button onClick={exportFile}>Exportar JSON</button>
      <button onClick={backupFile}>Backup com PDFs</button>
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
