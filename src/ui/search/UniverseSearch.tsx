// SPDX-License-Identifier: MPL-2.0
import { Fragment, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Project } from "../../domain/model";
import type { ReferenceSummary } from "../../domain/reference";
import { listReferences } from "../../persistence/referenceStore";
import { categoryPresentation } from "../categoryPresentation";
import { buildSearchIndex, highlightRanges, searchUniverse, type SearchResult } from "./search";
import "../../styles/search.css";

export function SearchTrigger({ open }: { open: () => void }) {
  return <button className="universe-search-trigger" onClick={open} aria-label="Buscar no universo" title="Buscar no universo · Ctrl/Cmd + K">
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
  </button>;
}
function Highlight({ text, query }: { text: string; query: string }) {
  const ranges = highlightRanges(text, query);
  return <>{ranges.map(([from, to], i) => {
    const before = text.slice(ranges[i - 1]?.[1] ?? 0, from);
    return <Fragment key={from}>{before}<mark>{text.slice(from, to)}</mark></Fragment>;
  })}{text.slice(ranges.at(-1)?.[1] ?? 0)}</>;
}

export function UniverseSearch({ project, dismiss, open }: {
  project: Project; dismiss: () => void; open: (result: SearchResult) => string | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null), input = useRef<HTMLInputElement>(null);
  const navigating = useRef(false);
  const listId = useId(), titleId = useId();
  const [query, setQuery] = useState("");
  const [references, setReferences] = useState<ReferenceSummary[]>([]);
  const [pdfUnavailable, setPdfUnavailable] = useState(false);
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");
  const { id: projectId, entities, relations } = project;
  const index = useMemo(() => buildSearchIndex({ id: projectId, entities, relations }, references), [entities, relations, projectId, references]);
  const { results, total } = useMemo(() => searchUniverse(index, query), [index, query]);
  const current = Math.min(active, Math.max(0, results.length - 1));
  useEffect(() => {
    const element = dialog.current!, previous = document.activeElement;
    navigating.current = false;
    element.showModal(); input.current?.focus();
    return () => { element.close(); if (!navigating.current && previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    listReferences(project.id).then(items => { if (!cancelled) setReferences(items); }, () => { if (!cancelled) setPdfUnavailable(true); });
    return () => { cancelled = true; };
  }, [project.id]);
  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>(`[data-result-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current, query]);
  function choose(result: SearchResult) {
    const failure = open(result);
    if (failure) { setError(failure); return; }
    navigating.current = true;
    dismiss();
  }
  return <dialog ref={dialog} className="universe-search" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); dismiss(); }}
    onPointerDown={event => { if (event.target === event.currentTarget) dismiss(); }}>
    <section>
      <h2 id={titleId} className="sr-only">Buscar no universo {project.name}</h2>
      <header className="universe-search-field">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
        <input ref={input} value={query} maxLength={200} placeholder="Buscar neste universo…" aria-label="Buscar neste universo"
          role="combobox" aria-autocomplete="list" aria-expanded={results.length > 0} aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${current}` : undefined} autoComplete="off" spellCheck={false}
          onChange={event => { setQuery(event.target.value); setActive(0); setError(""); }}
          onKeyDown={event => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (results.length) setActive((current + (event.key === "ArrowDown" ? 1 : results.length - 1)) % results.length);
            } else if (event.key === "Enter") { event.preventDefault(); if (results[current]) choose(results[current]); }
          }} />
        <button onClick={dismiss} aria-label="Fechar busca" title="Esc">×</button>
      </header>
      <div className="universe-search-status" role="status">
        {query.trim() ? total ? `${total} ${total === 1 ? "resultado" : "resultados"}${total > results.length ? ` · mostrando ${results.length}; refine sua busca` : ""}` : "Nenhum resultado neste universo." : "Elementos, documentos, relações e nomes de PDFs do universo aberto."}
      </div>
      {error && <p className="universe-search-error" role="alert">{error}</p>}
      <div id={listId} role="listbox" aria-label="Resultados da busca" className="universe-search-results">
        {results.map((result, i) => {
          const appearance = result.category === "Relação" || result.category === "PDF" ? { symbol: result.category === "PDF" ? "▤" : "↔", color: "#c4b4e2" } : categoryPresentation[result.category];
          return <div key={`${result.kind}:${result.id}`} id={`${listId}-${i}`} data-result-index={i} role="option"
            aria-selected={i === current} className="universe-search-result" style={{ "--result-color": appearance.color } as CSSProperties}
            onPointerDown={event => event.preventDefault()} onMouseMove={() => setActive(i)} onClick={() => choose(result)}>
            <span className="search-result-icon" aria-hidden="true">{appearance.symbol}</span>
            <span className="search-result-copy"><strong><Highlight text={result.title} query={query} /></strong>
              <small><Highlight text={result.context} query={query} /></small>
              {result.snippet && <span className="search-result-snippet"><Highlight text={result.snippet} query={query} /></span>}
            </span><span className="search-result-enter" aria-hidden="true">↵</span>
          </div>;
        })}
      </div>
      <footer><span>↑ ↓ navegar · Enter abrir · Esc fechar</span><span>Somente neste universo{pdfUnavailable ? " · PDFs indisponíveis" : ""}</span></footer>
    </section>
  </dialog>;
}
