// SPDX-License-Identifier: MPL-2.0
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReferenceSummary } from "../../domain/reference";
import { getReference, referenceError } from "../../persistence/referenceStore";

interface Preview { reference: ReferenceSummary; url?: string; error?: string }

export function PdfViewer({ reference, actionsHost, busy, replace, remove }: {
  reference: ReferenceSummary; actionsHost: HTMLElement | null; busy: boolean;
  replace: () => void; remove: () => void;
}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    getReference(reference.projectId, reference.id)
      .then((document) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(document.blob);
        setPreview({ reference, url: objectUrl });
      })
      .catch((error) => { if (active) setPreview({ reference, error: referenceError(error) }); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [reference]);

  const current = preview?.reference === reference ? preview : null;
  const canEmbed = navigator.pdfViewerEnabled !== false;
  return <>
    {actionsHost && createPortal(<details className="reference-menu reference-actions-menu">
      <summary aria-label="Opções do PDF" title="Opções do PDF">•••</summary>
      <div className="reference-menu-panel" onClick={event => {
        if ((event.target as HTMLElement).closest("button, a")) event.currentTarget.closest("details")?.removeAttribute("open");
      }}>
        {current?.url && <><a href={current.url} target="_blank" rel="noopener noreferrer">Abrir separadamente ↗</a><a href={current.url} download={reference.name}>Baixar PDF</a></>}
        <button disabled={busy} onClick={replace}>Substituir PDF</button>
        <button className="danger" disabled={busy} onClick={remove}>Remover PDF</button>
      </div>
    </details>, actionsHost)}
    <section className="pdf-preview" aria-label={`Documento: ${reference.name}`}>
      {!current ? <div className="pdf-placeholder" role="status">Carregando PDF…</div>
        : current.error || !current.url ? <div className="reference-error" role="alert">{current.error ?? "Não foi possível abrir o PDF."}</div>
        : canEmbed ? <object className="pdf-object" data={current.url} type="application/pdf" title={`Visualizador de ${reference.name}`}>
          <p className="pdf-placeholder">Este navegador não exibiu o PDF aqui. Use as opções do documento para abrir ou baixar.</p>
        </object> : <div className="pdf-placeholder">Este navegador não oferece visualização PDF integrada. Use as opções do documento para abrir separadamente ou baixar.</div>}
    </section>
  </>;
}
