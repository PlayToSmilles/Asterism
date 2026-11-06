// SPDX-License-Identifier: MPL-2.0
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
  const [actionsHost, setActionsHost] = useState<HTMLDivElement | null>(null);
  const selector = useRef<HTMLDetailsElement>(null);
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const replacementId = useRef<string | undefined>(undefined);
  const selected = references.find((reference) => reference.id === selectedId);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      root.current?.querySelectorAll<HTMLDetailsElement>(".reference-menu[open]").forEach(menu => {
        if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
      });
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => {
    let active = true;
    listReferences(projectId)
      .then((items) => {
        if (!active) return;
        setReferences(items);
        setSelectedId(current => current ?? (items.length === 1 ? items[0].id : null));
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
      setSelectedId(references.find(item => item.id !== selected.id)?.id ?? null);
      setConfirmRemove(false);
    } catch (error) {
      setError(referenceError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside ref={root} id="reference-library" className="reference-library" aria-label="Biblioteca de Referências" aria-busy={busy || loading}
      onKeyDown={event => { if (event.key === "Escape") { const menu = (event.target as HTMLElement).closest<HTMLDetailsElement>(".reference-menu[open]"); if (menu) { event.preventDefault(); menu.open = false; menu.querySelector<HTMLElement>("summary")?.focus(); } } }}>
      <header className="reference-topbar">
        <div className="reference-heading"><span className="eyebrow">BIBLIOTECA</span><h2>Referências</h2></div>
        <details className="reference-menu reference-selector" ref={selector}>
          <summary aria-label="Selecionar documento" title={selected?.name ?? "Selecionar documento"}>
            <span className="reference-selector-name">{selected?.name ?? "Selecionar documento"}</span><span aria-hidden="true">⌄</span>
          </summary>
          <div className="reference-menu-panel reference-list" aria-label="PDFs deste universo">
            {references.length === 0 ? <p className="muted">Nenhum PDF neste universo.</p> : references.map(reference => <button
              key={reference.id} className={`reference-item${selectedId === reference.id ? " active" : ""}`}
              disabled={busy} aria-pressed={selectedId === reference.id} onClick={() => {
                setSelectedId(reference.id); setConfirmRemove(false); selector.current?.removeAttribute("open");
              }}><span className="pdf-badge" aria-hidden="true">PDF</span><span><strong>{reference.name}</strong><small>{(reference.size / (reference.size < 1024 * 1024 ? 1024 : 1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {reference.size < 1024 * 1024 ? "KiB" : "MiB"}</small></span></button>)}
          </div>
        </details>
        <button className="primary reference-add" disabled={busy || loading} onClick={() => chooseFile()}>＋ Adicionar PDF</button>
        <div className="reference-action-slot" ref={setActionsHost} />
        <details className="reference-menu reference-info"><summary aria-label="Informações sobre referências" title="Informações sobre referências">i</summary>
          <div className="reference-menu-panel reference-info-panel">PDFs de até 20 MiB ficam neste navegador. Use Backup com PDFs para incluí-los; o JSON não inclui anexos. Imagens por URL continuam externas.</div>
        </details>
        <button className="icon-button reference-close" onClick={close} aria-label="Fechar referências">×</button>
      </header>
      <input className="sr-only" ref={input} type="file" disabled={busy || loading} accept=".pdf,application/pdf" aria-label="Selecionar PDF"
        onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file, replacementId.current); }} />
      {error && <div className="reference-error" role="alert"><span>{error}</span><button disabled={busy || loading} onClick={() => { setLoading(true); setReload(value => value + 1); }}>Recarregar lista</button></div>}
      {loading && <p className="muted" role="status">Carregando referências…</p>}
      {busy && <p className="muted" role="status">Salvando alteração…</p>}
      {confirmRemove && selected && <div className="reference-confirm" role="alertdialog" aria-label="Confirmar remoção de PDF">
        <p>Remover “{selected.name}” deste universo? Esta ação não pode ser desfeita.</p>
        <div className="button-row"><button disabled={busy} onClick={() => setConfirmRemove(false)}>Cancelar</button><button className="danger" disabled={busy} onClick={() => void remove()}>Confirmar remoção</button></div>
      </div>}
      {selected ? <PdfViewer reference={selected} actionsHost={actionsHost} busy={busy} replace={() => chooseFile(selected.id)} remove={() => setConfirmRemove(true)} />
        : !loading && <div className="pdf-placeholder">{references.length ? "Selecione um PDF para consultar." : "Nenhum PDF neste universo. Adicione uma referência para começar."}</div>}
    </aside>
  );
}
