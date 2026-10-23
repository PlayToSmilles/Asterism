// SPDX-License-Identifier: MPL-2.0
import { useEffect, useState } from "react";
import type { ReferenceSummary } from "../../domain/reference";
import { getReference, referenceError } from "../../persistence/referenceStore";

interface Preview {
  reference: ReferenceSummary;
  url?: string;
  error?: string;
}

export function PdfViewer({ reference }: { reference: ReferenceSummary }) {
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
      .catch((error) => {
        if (active) setPreview({ reference, error: referenceError(error) });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reference]);

  // Hide the previous file immediately when selection/replacement changes.
  const current = preview?.reference === reference ? preview : null;
  if (!current)
    return (
      <div className="pdf-placeholder" role="status">
        Carregando PDF…
      </div>
    );
  if (current.error || !current.url)
    return (
      <div className="reference-error" role="alert">
        {current.error ?? "Não foi possível abrir o PDF."}
      </div>
    );
  const canEmbed = navigator.pdfViewerEnabled !== false;
  return (
    <section
      className="pdf-preview"
      aria-label={`Documento: ${reference.name}`}
    >
      <div className="pdf-actions">
        <a href={current.url} target="_blank" rel="noopener noreferrer">
          Abrir separadamente ↗
        </a>
        <a href={current.url} download={reference.name}>
          Baixar PDF
        </a>
      </div>
      <p className="pdf-help">
        Páginas e zoom ficam nos controles do navegador. Se o PDF não aparecer,
        abra separadamente ou baixe o arquivo.
      </p>
      {canEmbed ? (
        <object
          className="pdf-object"
          data={current.url}
          type="application/pdf"
          title={`Visualizador de ${reference.name}`}
        >
          <p className="pdf-placeholder">
            Este navegador não exibiu o PDF aqui. Use as opções acima para abrir
            ou baixar.
          </p>
        </object>
      ) : (
        <div className="pdf-placeholder">
          Este navegador não oferece visualização PDF integrada. Abra
          separadamente ou baixe o documento.
        </div>
      )}
    </section>
  );
}
