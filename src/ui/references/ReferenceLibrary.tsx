import { useEffect, useRef, useState } from "react";
import type { ReferenceSummary } from "../../domain/reference";
import {
  listReferences,
  referenceError,
  removeReference,
  saveReference,
} from "../../persistence/referenceStore";
import { PdfViewer } from "./PdfViewer";
import "../../styles/references.css";

export function ReferenceLibrary({
  projectId,
  initialSelectedId,
  close,
}: {
  projectId: string;
  initialSelectedId?: string;
  close: () => void;
}) {
  const [references, setReferences] = useState<ReferenceSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [reload, setReload] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const replacementId = useRef<string | undefined>(undefined);
  const selected = references.find((reference) => reference.id === selectedId);

  useEffect(() => {
    let active = true;
    listReferences(projectId)
      .then((items) => {
        if (!active) return;
        setReferences(items);
        setLoading(false);
        setError(initialSelectedId && !items.some(item => item.id === initialSelectedId) ? "Esta referência não está mais disponível. Escolha outro PDF." : "");
      })
      .catch((error) => {
        if (active) {
          setError(referenceError(error));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [projectId, reload, initialSelectedId]);

  function chooseFile(id?: string) {
    replacementId.current = id;
    input.current?.click();
  }
  async function upload(file: File, id?: string) {
    setBusy(true);
    setError("");
    setConfirmRemove(false);
    try {
      const summary = await saveReference(projectId, file, id);
      setReferences((current) =>
        id
          ? current.map((item) => (item.id === id ? summary : item))
          : [summary, ...current],
      );
      setSelectedId(summary.id);
    } catch (error) {
      setError(referenceError(error));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await removeReference(projectId, selected.id);
      setReferences((current) =>
        current.filter((item) => item.id !== selected.id),
      );
      setSelectedId(null);
      setConfirmRemove(false);
    } catch (error) {
      setError(referenceError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside
      id="reference-library"
      className="reference-library"
      aria-label="Biblioteca de Referências"
      aria-busy={busy || loading}
    >
      <header className="reference-header">
        <div>
          <span className="eyebrow">BIBLIOTECA DO UNIVERSO</span>
          <h2>Referências</h2>
        </div>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Fechar referências"
        >
          ×
        </button>
      </header>
      <div className="reference-toolbar">
        <button
          className="primary"
          disabled={busy || loading}
          onClick={() => chooseFile()}
        >
          ＋ Adicionar PDF
        </button>
        <span>PDF · até 20 MiB por arquivo</span>
      </div>
      <input
        className="sr-only"
        ref={input}
        type="file"
        disabled={busy || loading}
        accept=".pdf,application/pdf"
        aria-label="Selecionar PDF"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file, replacementId.current);
        }}
      />
      <p className="reference-backup">
        Os PDFs ficam neste navegador e não são incluídos na exportação JSON.
        Guarde os arquivos originais.
      </p>
      {error && (
        <div className="reference-error" role="alert">
          <span>{error}</span>
          <button
            disabled={busy || loading}
            onClick={() => {
              setLoading(true);
              setReload((value) => value + 1);
            }}
          >
            Recarregar lista
          </button>
        </div>
      )}
      {loading ? (
        <p className="muted" role="status">
          Carregando referências…
        </p>
      ) : (
        <div className="reference-list" aria-label="PDFs deste universo">
          {references.length === 0 && (
            <p className="muted">
              Nenhum PDF neste universo. Adicione uma referência para consultar
              enquanto cria.
            </p>
          )}
          {references.map((reference) => (
            <button
              key={reference.id}
              className={`reference-item${selectedId === reference.id ? " active" : ""}`}
              disabled={busy}
              aria-pressed={selectedId === reference.id}
              onClick={() => {
                setSelectedId(reference.id);
                setConfirmRemove(false);
              }}
            >
              <span className="pdf-badge" aria-hidden="true">
                PDF
              </span>
              <span>
                <strong>{reference.name}</strong>
                <small>
                  {(
                    reference.size /
                    (reference.size < 1024 * 1024 ? 1024 : 1024 * 1024)
                  ).toLocaleString("pt-BR", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  {reference.size < 1024 * 1024 ? "KiB" : "MiB"}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}
      {busy && (
        <p className="muted" role="status">
          Salvando alteração…
        </p>
      )}
      {selected ? (
        <>
          <div className="reference-selected">
            <h3 title={selected.name}>{selected.name}</h3>
            <div className="button-row">
              <button disabled={busy} onClick={() => chooseFile(selected.id)}>
                Substituir PDF
              </button>
              <button
                className="danger"
                disabled={busy}
                onClick={() => setConfirmRemove(true)}
              >
                Remover
              </button>
            </div>
          </div>
          {confirmRemove && (
            <div className="reference-confirm">
              <p>
                Remover “{selected.name}” deste universo? Esta ação não pode ser
                desfeita.
              </p>
              <div className="button-row">
                <button disabled={busy} onClick={() => setConfirmRemove(false)}>
                  Cancelar
                </button>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() => {
                    void remove();
                  }}
                >
                  Confirmar remoção
                </button>
              </div>
            </div>
          )}
          <PdfViewer reference={selected} />
        </>
      ) : (
        !loading &&
        references.length > 0 && (
          <div className="pdf-placeholder">
            Selecione um PDF para consultar.
          </div>
        )
      )}
    </aside>
  );
}
